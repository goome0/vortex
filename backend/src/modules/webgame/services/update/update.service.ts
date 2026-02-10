import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { WebGameUpdateInputDTO } from '../../webgame.input';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';

@Injectable()
export class UpdateService {
  private readonly logger = new Logger(UpdateService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(input: WebGameUpdateInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Updating webgame for ${currentUser.username} - action: ${input.action}`);

    const webSession = await this.compHackAuthService.getWebGameSession(currentUser.username);
    const response = await this.imagineService.updateWebGame({
      ...webSession,
      action: input.action,
      data: input.data,
    });

    return SuccessResponse.toJson({
      code: 'UPDATE_WEBGAME_SUCCESS',
      message: 'WebGame updated successfully',
      path: '/webgame/update',
      data: response,
    });
  }
}
