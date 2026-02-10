import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { WebGameStartInputDTO } from '../../webgame.input';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';

@Injectable()
export class StartService {
  private readonly logger = new Logger(StartService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(input: WebGameStartInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Starting webgame ${input.type} for ${currentUser.username}`);

    const webSession = await this.compHackAuthService.getWebGameSession(currentUser.username);
    const response = await this.imagineService.startWebGame({
      ...webSession,
      type: input.type,
    });

    return SuccessResponse.toJson({
      code: 'START_WEBGAME_SUCCESS',
      message: 'WebGame started successfully',
      path: '/webgame/start',
      data: response,
    });
  }
}
