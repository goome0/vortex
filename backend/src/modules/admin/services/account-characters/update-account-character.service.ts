import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { CompHackEntities, WorldEntities } from '@/database/entities';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUpdateAccountCharacterInputDTO } from '../../admin.input';

@Injectable()
export class UpdateAccountCharacterService {
  private readonly logger = new Logger(UpdateAccountCharacterService.name);

  public constructor(
    @InjectRepository(CompHackEntities.Account)
    private readonly accountRepository: Repository<CompHackEntities.Account>,
    @InjectRepository(WorldEntities.Character)
    private readonly characterRepository: Repository<WorldEntities.Character>,
    @InjectRepository(WorldEntities.AccountWorldData)
    private readonly accountWorldDataRepository: Repository<WorldEntities.AccountWorldData>,
  ) {}

  private async getAccountByUsername(username: string): Promise<Pick<CompHackEntities.Account, 'uid' | 'characters'>> {
    const u = username.trim();
    const account = await this.accountRepository
      .createQueryBuilder('a')
      .select(['a.uid', 'a.characters'])
      .where('LOWER(a.username) = LOWER(:username)', { username: u })
      .getOne();

    if (!account?.uid) {
      throw new NotFoundException(`Account not found: ${u}`);
    }

    return { uid: account.uid, characters: account.characters ?? null };
  }

  private parseCharacterUidsFromBlob(characters: Buffer | null): string[] {
    if (!characters || characters.length === 0) return [];

    const uids: string[] = [];
    for (let offset = 0; offset + 16 <= characters.length; offset += 16) {
      const chunk = characters.subarray(offset, offset + 16);
      const hex = chunk.toString('hex').toLowerCase();
      if (hex === '00000000000000000000000000000000') continue;
      if (hex.length !== 32) continue;
      const uid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      uids.push(uid);
    }

    return [...new Set(uids)];
  }

  public async execute(input: AdminUpdateAccountCharacterInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Updating character ${input.characterUid} for ${input.username} - requested by ${currentUser.username}`);

    const username = input.username.trim();
    const account = await this.getAccountByUsername(username);
    const accountUid = account.uid.trim();
    const accountUidNoDashes = accountUid.replace(/-/g, '');
    const characterUid = input.characterUid.trim();
    const characterUidNorm = characterUid.toLowerCase();

    const allowedUids = new Set(this.parseCharacterUidsFromBlob(account.characters ?? null).map((u) => u.toLowerCase()));
    const isAllowedByBlob = allowedUids.has(characterUidNorm);

    // Buscar personagem no banco world (comp_hack e world são bancos diferentes)
    const rawRows = (await this.characterRepository.manager.query(
      `SELECT UID, Name, Account, WorldID, KillTime, LastLogin, Points, LNC, LoginPoints
       FROM world.Character
       WHERE UID = ?`,
      [characterUid],
    )) as { UID: string; Name: string | null; Account: string | null; WorldID: number | null; KillTime: string | null; LastLogin: string | null; Points: number | null; LNC: number | null; LoginPoints: number | null }[];

    const row = rawRows[0];
    if (!row) {
      this.logger.warn(`Character not found. characterUid=${characterUid}`);
      throw new NotFoundException('Character not found for this account');
    }

    if (!isAllowedByBlob) {
      const accountMatch =
        row.Account === accountUid ||
        (row.Account != null && row.Account.replace(/-/g, '') === accountUidNoDashes) ||
        (row.Account != null && row.Account.trim().toLowerCase() === username.toLowerCase());
      let awdMatch = false;
      if (!accountMatch) {
        const awdRows = (await this.characterRepository.manager.query(
          `SELECT UID FROM world.AccountWorldData WHERE Account = ? OR (Account IS NOT NULL AND REPLACE(Account, '-', '') = ?)`,
          [accountUid, accountUidNoDashes],
        )) as { UID: string }[];
        const awdUids = new Set(awdRows.map((r) => r.UID));
        awdMatch = row.Account != null && awdUids.has(row.Account);
      }
      if (!accountMatch && !awdMatch) {
        this.logger.warn(`Character not owned by account. characterUid=${characterUid} accountUid=${accountUid}`);
        throw new NotFoundException('Character not found for this account');
      }
    }

    let name = row.Name;
    let points = row.Points;
    let lnc = row.LNC;
    let loginPoints = row.LoginPoints;
    let killTime = row.KillTime;

    if (typeof input.name === 'string') {
      const nextName = input.name.trim();
      if (nextName.length < 1 || nextName.length > 32) {
        throw new BadRequestException('Character name must be between 1 and 32 characters');
      }
      const existing = (await this.characterRepository.manager.query(
        `SELECT UID FROM world.Character WHERE UID <> ? AND Name IS NOT NULL AND LOWER(TRIM(Name)) = LOWER(?) LIMIT 1`,
        [characterUid, nextName],
      )) as { UID: string }[];
      if (existing.length > 0) {
        throw new BadRequestException('Character name is already taken');
      }
      name = nextName;
    }

    if (typeof input.points === 'number') points = input.points;
    if (typeof input.lnc === 'number') lnc = input.lnc;
    if (typeof input.loginPoints === 'number') loginPoints = input.loginPoints;
    if (input.revive) killTime = '0';

    await this.characterRepository.manager.query(
      `UPDATE world.Character SET Name = ?, Points = ?, LNC = ?, LoginPoints = ?, KillTime = ? WHERE UID = ?`,
      [name ?? null, points ?? null, lnc ?? null, loginPoints ?? null, killTime ?? null, characterUid],
    );

    return SuccessResponse.toJson({
      code: 'UPDATE_ACCOUNT_CHARACTER_SUCCESS',
      message: 'Character updated successfully',
      path: '/admin/account/character/update',
      data: {
        uid: row.UID,
        name,
        worldId: row.WorldID,
        killTime,
        lastLogin: row.LastLogin,
        points,
        lnc,
        loginPoints,
      },
    });
  }
}
