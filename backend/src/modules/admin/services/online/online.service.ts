import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { AdminOnlineInputDTO } from '../../admin.input';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';

@Injectable()
export class OnlineService {
  private readonly logger = new Logger(OnlineService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(input: AdminOnlineInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Getting online status - requested by ${currentUser.username}`);

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const response = await this.imagineService.getOnline({
      ...session,
      targets: input.targets,
    });

    this.logger.log(`comp_hack /admin/online raw: ${JSON.stringify(response)}`);

    return SuccessResponse.toJson({
      code: 'ONLINE_SUCCESS',
      message: 'Online status retrieved successfully',
      path: '/admin/online',
      data: response,
    });
  }
}
