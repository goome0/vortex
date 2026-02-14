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
    const accountUid = account.uid;
    const characterUid = input.characterUid.trim();
    const characterUidNorm = characterUid.toLowerCase();

    const accountUidNoDashes = accountUid.replace(/-/g, '');
    const awdRows = await this.accountWorldDataRepository
      .createQueryBuilder('awd')
      .select(['awd.uid'])
      .where('awd.account = :accountUid', { accountUid })
      .orWhere('awd.account IS NOT NULL AND LOWER(TRIM(awd.account)) = LOWER(:username)', { username })
      .getMany();
    const awdUids = awdRows.map((r) => r.uid).filter(Boolean);

    const allowedUids = new Set(this.parseCharacterUidsFromBlob(account.characters ?? null).map((u) => u.toLowerCase()));
    const isAllowedByBlob = allowedUids.has(characterUidNorm);

    const qb = this.characterRepository
      .createQueryBuilder('c')
      .where('c.uid = :characterUid', { characterUid });

    if (!isAllowedByBlob) {
      qb.andWhere(
        [
          '(c.account = :accountUid)',
          '(c.account IS NOT NULL AND LOWER(TRIM(c.account)) = LOWER(:username))',
          '(c.account IS NOT NULL AND REPLACE(c.account, \'-\', \'\') = :accountUidNoDashes)',
          awdUids.length > 0 ? '(c.account IN (:...awdUids))' : '0=1',
        ].join(' OR '),
        { accountUid, username, accountUidNoDashes, awdUids },
      );
    }

    const character = await qb.getOne();

    if (!character) {
      throw new NotFoundException('Character not found for this account');
    }

    if (typeof input.name === 'string') {
      const nextName = input.name.trim();
      if (nextName.length < 1 || nextName.length > 32) {
        throw new BadRequestException('Character name must be between 1 and 32 characters');
      }

      const existing = await this.characterRepository
        .createQueryBuilder('c')
        .select(['c.uid'])
        .where('c.uid <> :uid', { uid: character.uid })
        .andWhere('c.name IS NOT NULL')
        .andWhere('LOWER(c.name) = LOWER(:name)', { name: nextName })
        .getOne();

      if (existing?.uid) {
        throw new BadRequestException('Character name is already taken');
      }

      character.name = nextName;
    }

    if (typeof input.points === 'number') character.points = input.points;
    if (typeof input.lnc === 'number') character.lnc = input.lnc;
    if (typeof input.loginPoints === 'number') character.loginPoints = input.loginPoints;
    if (input.revive) character.killTime = '0';

    const saved = await this.characterRepository.save(character);

    return SuccessResponse.toJson({
      code: 'UPDATE_ACCOUNT_CHARACTER_SUCCESS',
      message: 'Character updated successfully',
      path: '/admin/account/character/update',
      data: {
        uid: saved.uid,
        name: saved.name,
        worldId: saved.worldId,
        killTime: saved.killTime,
        lastLogin: saved.lastLogin,
        points: saved.points,
        lnc: saved.lnc,
        loginPoints: saved.loginPoints,
      },
    });
  }
}
