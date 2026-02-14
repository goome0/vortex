import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { CompHackEntities, WorldEntities } from '@/database/entities';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminLookupAccountByCharacterNameInputDTO } from '../../admin.input';

type LookupResult = {
  username: string;
  characterName: string;
  worldId: number | null;
};

@Injectable()
export class LookupAccountByCharacterNameService {
  private readonly logger = new Logger(LookupAccountByCharacterNameService.name);

  public constructor(
    @InjectRepository(CompHackEntities.Account)
    private readonly accountRepository: Repository<CompHackEntities.Account>,
    @InjectRepository(WorldEntities.Character)
    private readonly characterRepository: Repository<WorldEntities.Character>,
  ) {}

  public async execute(input: AdminLookupAccountByCharacterNameInputDTO, currentUser: CurrentUserDTO) {
    const characterName = input.characterName.trim();
    this.logger.log(`Lookup account by character name "${characterName}" - requested by ${currentUser.username}`);

    if (!characterName) {
      return SuccessResponse.toJson({
        code: 'LOOKUP_ACCOUNT_BY_CHARACTER_SUCCESS',
        message: 'Character name is required',
        path: '/admin/account/lookup-by-character-name',
        data: { items: [], total: 0 },
      });
    }

    // Search world.Character by Name (case-insensitive, partial match)
    // Join with comp_hack.Account to get Username
    const rawRows = (await this.characterRepository.manager.query(
      `SELECT c.Name AS characterName, c.WorldID AS worldId, a.Username AS username
       FROM world.Character c
       INNER JOIN comp_hack.Account a
         ON (a.UID = c.Account OR REPLACE(a.UID, '-', '') = REPLACE(IFNULL(c.Account, ''), '-', ''))
       WHERE c.Name IS NOT NULL AND LOWER(c.Name) LIKE LOWER(?)
       ORDER BY c.Name ASC
       LIMIT 50`,
      [`%${characterName}%`],
    )) as { characterName: string; worldId: number | null; username: string }[];

    const items: LookupResult[] = rawRows.map((r) => ({
      username: r.username ?? '',
      characterName: r.characterName ?? '',
      worldId: r.worldId,
    }));

    return SuccessResponse.toJson({
      code: 'LOOKUP_ACCOUNT_BY_CHARACTER_SUCCESS',
      message: 'Lookup completed successfully',
      path: '/admin/account/lookup-by-character-name',
      data: { items, total: items.length },
    });
  }
}
