import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { CompHackEntities, WorldEntities } from '@/database/entities';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminListAccountCharactersInputDTO } from '../../admin.input';

type AccountCharacterDTO = {
  uid: string;
  name: string | null;
  worldId: number | null;
  killTime: string | null;
  lastLogin: string | null;
  points: number | null;
  lnc: number | null;
  loginPoints: number | null;
};

@Injectable()
export class ListAccountCharactersService {
  private readonly logger = new Logger(ListAccountCharactersService.name);

  public constructor(
    @InjectRepository(CompHackEntities.Account)
    private readonly accountRepository: Repository<CompHackEntities.Account>,
    @InjectRepository(WorldEntities.Character)
    private readonly characterRepository: Repository<WorldEntities.Character>,
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

  public async execute(input: AdminListAccountCharactersInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Listing characters for ${input.username} - requested by ${currentUser.username}`);

    const username = input.username.trim();
    const account = await this.getAccountByUsername(username);
    const accountUid = account.uid.trim();
    const accountUidNoDashes = accountUid.replace(/-/g, '');

    const rawRows = (await this.characterRepository.manager.query(
      `SELECT UID, Name, WorldID, KillTime, LastLogin, Points, LNC, LoginPoints
       FROM world.Character
       WHERE Account = ?
          OR (Account IS NOT NULL AND REPLACE(Account, '-', '') = ?)`,
      [accountUid, accountUidNoDashes],
    )) as {
      UID: string;
      Name: string | null;
      WorldID: number | null;
      KillTime: string | null;
      LastLogin: string | null;
      Points: number | null;
      LNC: number | null;
      LoginPoints: number | null;
    }[];

    const characters = rawRows.map((r) => ({
      uid: r.UID,
      name: r.Name,
      worldId: r.WorldID,
      killTime: r.KillTime,
      lastLogin: r.LastLogin,
      points: r.Points,
      lnc: r.LNC,
      loginPoints: r.LoginPoints,
    }));

    const items: AccountCharacterDTO[] = characters.map((c) => ({
      uid: c.uid,
      name: c.name,
      worldId: c.worldId,
      killTime: c.killTime,
      lastLogin: c.lastLogin,
      points: c.points,
      lnc: c.lnc,
      loginPoints: c.loginPoints,
    }));

    return SuccessResponse.toJson({
      code: 'LIST_ACCOUNT_CHARACTERS_SUCCESS',
      message: 'Account characters retrieved successfully',
      path: '/admin/account/characters',
      data: { items, total: items.length },
    });
  }
}
