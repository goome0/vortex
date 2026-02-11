import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { ImagineService } from '@/common/imagine/imagine.service';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GetWorldsService {
  private readonly logger = new Logger(GetWorldsService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(currentUser: CurrentUserDTO) {
    this.logger.log(`Getting active worlds - requested by ${currentUser.username}`);

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const online = await this.imagineService.getOnline(session);

    const worlds = (online.counts ?? [])
      .map((c) => ({
        world_id: Number(c.world_id),
        character_count: Number(c.character_count ?? 0),
      }))
      .filter((w) => Number.isFinite(w.world_id) && w.world_id >= 0)
      .sort((a, b) => a.world_id - b.world_id);

    return SuccessResponse.toJson({
      code: 'GET_WORLDS_SUCCESS',
      message: 'Worlds retrieved successfully',
      path: '/admin/worlds',
      data: {
        worlds,
        total_worlds: worlds.length,
        total_characters: worlds.reduce((sum, w) => sum + (Number.isFinite(w.character_count) ? w.character_count : 0), 0),
      },
    });
  }
}
