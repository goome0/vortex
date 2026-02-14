import axios from 'axios';
import { createHash } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { createConnection } from 'mysql2/promise';

type DbAccountRow = {
  Username: string | null;
  Password: string | null;
  UserLevel: number | null;
};

const sha512Hex = (input: string): string => createHash('sha512').update(input).digest('hex');

const loadEnv = () => {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'backend', '.env'),
  ];

  for (const file of candidates) {
    dotenv.config({ path: file, override: false });
  }
};

const requireEnv = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var ${key}`);
  return v;
};

const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, '');

async function main() {
  loadEnv();

  const imagineApi = normalizeBaseUrl(requireEnv('IMAGINE_API'));

  const dbHost = requireEnv('DB_HOST');
  const dbPort = Number(requireEnv('DB_PORT'));
  const dbUsername = requireEnv('DB_USERNAME');
  const dbPassword = requireEnv('DB_PASSWORD');
  const dbDatabase = requireEnv('DB_DATABASE');

  const connection = await createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUsername,
    password: dbPassword,
    database: dbDatabase,
    multipleStatements: false,
  });

  try {
    const [rows] = (await connection.query(
      `
        SELECT Username, Password, UserLevel
        FROM comp_hack.Account
        WHERE Enabled = 1 AND UserLevel >= 300
        ORDER BY UserLevel DESC
        LIMIT 1
      `.trim(),
    )) as unknown as [Array<DbAccountRow>, unknown];

    const admin = rows?.[0];
    const username = String(admin?.Username ?? '').trim().toLowerCase();
    const passwordHash = String(admin?.Password ?? '').trim();
    const userLevel = admin?.UserLevel ?? null;

    if (!username || !passwordHash || !userLevel || userLevel < 300) {
      throw new Error(
        'No comp_hack account with UserLevel >= 300 found (required to create promos).',
      );
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const day = 86400;
    const hour = 3600;

    // Shop ProductIDs are defined in `comp_hack/datastore/shops/*.xml`.
    // Using common IDs from `shop-001.xml` should work for demo purposes.
    const demoPromos = [
      {
        code: 'VTX_DEMO_ACTIVE_01',
        startTime: nowSec - hour,
        endTime: nowSec + day * 7,
        useLimit: 1,
        limitType: 'account',
        items: [1201],
      },
      {
        code: 'VTX_DEMO_ACTIVE_02',
        startTime: nowSec - day,
        endTime: nowSec + day * 3,
        useLimit: 2,
        limitType: 'character',
        items: [1202],
      },
      {
        code: 'VTX_DEMO_ACTIVE_03',
        startTime: nowSec - day * 2,
        endTime: nowSec + day * 14,
        useLimit: 5,
        limitType: 'world',
        items: [1203, 1301],
      },
      {
        code: 'VTX_DEMO_SCHEDULED_01',
        startTime: nowSec + hour * 2,
        endTime: nowSec + day * 7,
        useLimit: 1,
        limitType: 'account',
        items: [1402],
      },
      {
        code: 'VTX_DEMO_SCHEDULED_02',
        startTime: nowSec + day,
        endTime: nowSec + day * 10,
        useLimit: 3,
        limitType: 'world',
        items: [2006],
      },
      {
        code: 'VTX_DEMO_EXPIRED_01',
        startTime: nowSec - day * 14,
        endTime: nowSec - day * 7,
        useLimit: 1,
        limitType: 'account',
        items: [2007],
      },
      {
        code: 'VTX_DEMO_EXPIRED_02',
        startTime: nowSec - day * 30,
        endTime: nowSec - day * 1,
        useLimit: 10,
        limitType: 'character',
        items: [2101],
      },
      // Duplicate code to showcase variants + delete warning in GM Panel.
      {
        code: 'VTX_DEMO_DUPLICATE',
        startTime: nowSec - hour,
        endTime: nowSec + day * 30,
        useLimit: 1,
        limitType: 'account',
        items: [1204],
      },
      {
        code: 'VTX_DEMO_DUPLICATE',
        startTime: nowSec - day * 3,
        endTime: nowSec + day * 2,
        useLimit: 1,
        limitType: 'account',
        items: [1207],
      },
    ];

    const getChallenge = async (): Promise<string> => {
      const { data } = await axios.post<{ challenge?: string }>(
        `${imagineApi}/api/auth/get_challenge`,
        { username },
        { timeout: 15000 },
      );
      if (!data?.challenge) throw new Error('Imagine API did not return a challenge.');
      return data.challenge;
    };

    const createPromo = async (p: (typeof demoPromos)[number]) => {
      const challenge = await getChallenge();
      const reply = sha512Hex(`${passwordHash}${challenge}`);
      const { data } = await axios.post<{ error?: string }>(
        `${imagineApi}/api/admin/create_promo`,
        {
          session_username: username,
          challenge: reply,
          code: p.code,
          startTime: p.startTime,
          endTime: p.endTime,
          useLimit: p.useLimit,
          limitType: p.limitType,
          items: p.items,
        },
        { timeout: 20000 },
      );

      return { code: p.code, error: data?.error ?? '' };
    };

    const created: Array<{ code: string; error: string }> = [];
    for (const p of demoPromos) {
      created.push(await createPromo(p));
    }

    const count = created.length;
    const nonSuccess = created.filter((c) => c.error && c.error !== 'Success');

    // Validate that `get_promos` can see at least the created codes.
    const challenge = await getChallenge();
    const reply = sha512Hex(`${passwordHash}${challenge}`);
    const { data: promosResponse } = await axios.post<{ promos?: Array<{ code?: string }> }>(
      `${imagineApi}/api/admin/get_promos`,
      { session_username: username, challenge: reply },
      { timeout: 20000 },
    );

    const promoCodes = new Set((promosResponse?.promos ?? []).map((p) => String(p.code ?? '').trim().toUpperCase()));
    const createdPresent = created.filter((c) => promoCodes.has(c.code.trim().toUpperCase())).length;

    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(
        {
          adminUser: username,
          attemptedCreates: count,
          createdVisibleInList: createdPresent,
          warnings: nonSuccess,
        },
        null,
        2,
      ),
    );
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err?.stack || err);
  process.exitCode = 1;
});
