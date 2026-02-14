import axios from 'axios';
import { createHash, randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import path from 'path';
import { createConnection } from 'mysql2/promise';
import { PromisePool } from '@supercharge/promise-pool';

type Args = {
  accounts: number;
  news: number;
  promos: number;
  concurrency: number;
  prefix: string;
};

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

const parseArgs = (): Args => {
  const defaults: Args = {
    accounts: 300,
    news: 100,
    promos: 100,
    concurrency: 10,
    prefix: 'VTX_LOAD',
  };

  const argv = process.argv.slice(2);
  const out: Args = { ...defaults };

  const readNumber = (value: string | undefined, fallback: number) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--accounts') out.accounts = readNumber(argv[i + 1], out.accounts);
    if (a === '--news') out.news = readNumber(argv[i + 1], out.news);
    if (a === '--promos') out.promos = readNumber(argv[i + 1], out.promos);
    if (a === '--concurrency') out.concurrency = readNumber(argv[i + 1], out.concurrency);
    if (a === '--prefix') out.prefix = String(argv[i + 1] ?? out.prefix);
  }

  out.accounts = Math.max(0, Math.floor(out.accounts));
  out.news = Math.max(0, Math.floor(out.news));
  out.promos = Math.max(0, Math.floor(out.promos));
  out.concurrency = Math.max(1, Math.min(50, Math.floor(out.concurrency)));
  out.prefix = out.prefix.trim() || defaults.prefix;

  return out;
};

const pad = (n: number, width: number) => String(n).padStart(width, '0');

const usernameSafe = (input: string) => input.toLowerCase().replace(/[^a-z0-9]/g, '');

async function main() {
  loadEnv();
  const args = parseArgs();

  const imagineApi = normalizeBaseUrl(requireEnv('IMAGINE_API'));

  const dbHost = requireEnv('DB_HOST');
  const dbPort = Number(requireEnv('DB_PORT'));
  const dbUsername = requireEnv('DB_USERNAME');
  const dbPassword = requireEnv('DB_PASSWORD');
  const dbDatabase = requireEnv('DB_DATABASE');

  const runId = `${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}_${faker.string.alphanumeric(6).toUpperCase()}`;
  const usernamePrefix = usernameSafe(`${args.prefix}_${runId}_`);
  const promoPrefix = `${args.prefix}_${runId}`.toUpperCase();
  const newsPrefix = `${args.prefix.toLowerCase()}-${runId.toLowerCase()}`;

  if (args.accounts > 0 || args.promos > 0) {
    try {
      await axios.post(
        `${imagineApi}/api/auth/get_challenge`,
        { username: 'admin' },
        { timeout: 2500 },
      );
    } catch (err: any) {
      const code = String(err?.code ?? '');
      if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ECONNRESET' || code === 'ETIMEDOUT') {
        throw new Error(
          `IMAGINE_API is not reachable (${imagineApi}). Start comp_hack WebAPI first, then rerun this seeder.`,
        );
      }
    }
  }

  const connection = await createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUsername,
    password: dbPassword,
    database: dbDatabase,
    multipleStatements: false,
  });

  try {
    // ---- Accounts (Imagine API register)
    const password = 'Test123!A';
    const accounts = Array.from({ length: args.accounts }, (_, idx) => {
      const n = idx + 1;
      const username = `${usernamePrefix}${pad(n, 4)}`;
      const email = `${username}@example.com`;
      return { username, email, password };
    });

    const registerOne = async (a: { username: string; email: string; password: string }) => {
      const { data } = await axios.post<{ error?: string }>(
        `${imagineApi}/api/account/register`,
        a,
        { timeout: 20000 },
      );
      const error = String(data?.error ?? '').trim();
      return { username: a.username, error };
    };

    const accountsResult = await PromisePool.withConcurrency(args.concurrency)
      .for(accounts)
      .process(async (a) => registerOne(a));

    // ---- News (direct DB insert)
    const newsCategories = ['Event', 'Patch Notes', 'Maintenance', 'Community', 'Guide', 'Promotion'];
    const badgeVariants = ['default', 'info', 'warning', 'danger'] as const;

    const insertNewsSql = `
      INSERT INTO vtx_news
      (
        id, slug, title, excerpt, content, category,
        badgeVariant, featured, readTime, imageUrl,
        isPublished, publishedAt, createdByUsername, updatedByUsername,
        createdAt, updatedAt
      )
      VALUES
      (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )
    `.trim();

    const now = new Date();
    const newsRows = Array.from({ length: args.news }, (_, idx) => {
      const n = idx + 1;
      const slug = `${newsPrefix}-${pad(n, 4)}`;
      const title = `${faker.word.words({ count: { min: 3, max: 7 } })} (${pad(n, 3)})`;
      const excerpt = faker.lorem.sentence({ min: 8, max: 16 });
      const content = faker.lorem.paragraphs({ min: 3, max: 6 }, '\n\n');
      const category = faker.helpers.arrayElement(newsCategories);
      const badgeVariant = faker.helpers.arrayElement(badgeVariants);
      const featured = faker.datatype.boolean({ probability: 0.1 });
      const readTime = `${faker.number.int({ min: 1, max: 9 })} min`;
      const isPublished = faker.datatype.boolean({ probability: 0.75 });
      const publishedAt = isPublished ? new Date(now.getTime() - faker.number.int({ min: 0, max: 1000 * 60 * 60 * 24 * 30 })) : null;

      return {
        id: randomUUID(),
        slug,
        title,
        excerpt,
        content,
        category,
        badgeVariant,
        featured,
        readTime,
        imageUrl: null as string | null,
        isPublished,
        publishedAt,
        createdByUsername: 'seed',
        updatedByUsername: 'seed',
        createdAt: now,
        updatedAt: now,
      };
    });

    const newsInsertErrors: Array<{ slug: string; error: string }> = [];
    for (const row of newsRows) {
      try {
        // MariaDB expects tinyint(1) for boolean typically.
        await connection.execute(insertNewsSql, [
          row.id,
          row.slug,
          row.title,
          row.excerpt,
          row.content,
          row.category,
          row.badgeVariant,
          row.featured ? 1 : 0,
          row.readTime,
          row.imageUrl,
          row.isPublished ? 1 : 0,
          row.publishedAt,
          row.createdByUsername,
          row.updatedByUsername,
          row.createdAt,
          row.updatedAt,
        ]);
      } catch (err: any) {
        newsInsertErrors.push({ slug: row.slug, error: String(err?.message ?? err) });
      }
    }

    // ---- Promos (Imagine API admin create_promo)
    let promoAdminUsername = '';
    let promoAdminPasswordHash = '';
    let promoAdminUserLevel: number | null = null;

    if (args.promos > 0) {
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
      promoAdminUsername = String(admin?.Username ?? '').trim().toLowerCase();
      promoAdminPasswordHash = String(admin?.Password ?? '').trim();
      promoAdminUserLevel = admin?.UserLevel ?? null;

      if (!promoAdminUsername || !promoAdminPasswordHash || !promoAdminUserLevel || promoAdminUserLevel < 300) {
        throw new Error('No comp_hack account with UserLevel >= 300 found (required to create promos).');
      }
    }

    const getChallenge = async (): Promise<string> => {
      const { data } = await axios.post<{ challenge?: string }>(
        `${imagineApi}/api/auth/get_challenge`,
        { username: promoAdminUsername },
        { timeout: 15000 },
      );
      if (!data?.challenge) throw new Error('Imagine API did not return a challenge.');
      return data.challenge;
    };

    const promoLimitTypes = ['account', 'character', 'world'] as const;
    const demoProductIds = [
      1201, 1202, 1203, 1204, 1205, 1206, 1207, 1301, 1402, 2006, 2007, 2101,
    ];

    const nowSec = Math.floor(Date.now() / 1000);
    const day = 86400;
    const hour = 3600;

    const promos = Array.from({ length: args.promos }, (_, idx) => {
      const n = idx + 1;
      const code = `${promoPrefix}_${pad(n, 4)}`;
      const kind = faker.helpers.arrayElement(['active', 'scheduled', 'expired'] as const);
      const limitType = faker.helpers.arrayElement(promoLimitTypes);
      const useLimit = faker.number.int({ min: 1, max: 10 });

      let startTime = nowSec - hour;
      let endTime = nowSec + day * 7;

      if (kind === 'scheduled') {
        startTime = nowSec + faker.number.int({ min: 1, max: 24 }) * hour;
        endTime = startTime + faker.number.int({ min: 2, max: 21 }) * day;
      } else if (kind === 'expired') {
        endTime = nowSec - faker.number.int({ min: 1, max: 14 }) * day;
        startTime = endTime - faker.number.int({ min: 2, max: 30 }) * day;
      } else {
        startTime = nowSec - faker.number.int({ min: 1, max: 48 }) * hour;
        endTime = nowSec + faker.number.int({ min: 1, max: 30 }) * day;
      }

      const items = faker.helpers.arrayElements(demoProductIds, {
        min: 1,
        max: 3,
      });

      return { code, startTime, endTime, useLimit, limitType, items };
    });

    const createPromoOne = async (p: (typeof promos)[number]) => {
      const challenge = await getChallenge();
      const reply = sha512Hex(`${promoAdminPasswordHash}${challenge}`);
      const { data } = await axios.post<{ error?: string }>(
        `${imagineApi}/api/admin/create_promo`,
        {
          session_username: promoAdminUsername,
          challenge: reply,
          code: p.code,
          startTime: p.startTime,
          endTime: p.endTime,
          useLimit: p.useLimit,
          limitType: p.limitType,
          items: p.items,
        },
        { timeout: 25000 },
      );

      const error = String(data?.error ?? '').trim();
      return { code: p.code, error };
    };

    const promosResult = await PromisePool.withConcurrency(Math.min(5, args.concurrency))
      .for(promos)
      .process(async (p) => createPromoOne(p));

    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(
        {
          runId,
          prefixes: {
            accounts: usernamePrefix,
            news: newsPrefix,
            promos: promoPrefix,
          },
          requested: {
            accounts: args.accounts,
            news: args.news,
            promos: args.promos,
          },
          accounts: {
            attempted: args.accounts,
            created: accountsResult.results.filter((r) => r.error === 'Success').length,
            nonSuccess: accountsResult.results.filter((r) => r.error && r.error !== 'Success').slice(0, 10),
            errors: accountsResult.errors?.slice(0, 10),
            samplePassword: password,
          },
          news: {
            attempted: args.news,
            inserted: args.news - newsInsertErrors.length,
            errors: newsInsertErrors.slice(0, 10),
          },
          promos: {
            attempted: args.promos,
            created: promosResult.results.filter((r) => r.error === 'Success').length,
            nonSuccess: promosResult.results.filter((r) => r.error && r.error !== 'Success').slice(0, 10),
            errors: promosResult.errors?.slice(0, 10),
            adminUser: promoAdminUsername,
          },
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
