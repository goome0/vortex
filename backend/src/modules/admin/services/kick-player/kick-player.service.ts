import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { AdminKickPlayerInputDTO } from '../../admin.input';

@Injectable()
export class KickPlayerService {
  private readonly logger = new Logger(KickPlayerService.name);

  public constructor(private readonly imagineService: ImagineService) {}

  public async execute(input: AdminKickPlayerInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Kicking player ${input.username} - requested by ${currentUser.username}`);

    const response = await this.imagineService.kickPlayer({
      session_username: currentUser.username,
      challenge: currentUser.challenge,
      username: input.username,
      kick_level: input.kick_level,
    });

    return SuccessResponse.toJson({
      code: 'KICK_PLAYER_SUCCESS',
      message: 'Player kicked successfully',
      path: '/admin/kick-player',
      data: response,
    });
  }
}
