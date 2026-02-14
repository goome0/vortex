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

    const rawTargets = input.targets ?? [];
    this.logger.log(`targets received: ${JSON.stringify(rawTargets)}`);

    // comp_hack expects each target as { name: string, type: string } - ensure proper format
    const targets = rawTargets
      .filter((t): t is { name: string; type: string } => !!t && typeof t.name === 'string' && typeof t.type === 'string')
      .map((t) => ({ name: String(t.name).trim(), type: String(t.type).trim() }))
      .filter((t) => t.name.length > 0);

    if (targets.length === 0 && rawTargets.length > 0) {
      this.logger.warn('All targets were invalid (missing name/type) - comp_hack will return counts only');
    }

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const body = { ...session, targets };
    this.logger.log(`sending to comp_hack: ${JSON.stringify({ ...body, challenge: '[REDACTED]' })}`);

    const response = await this.imagineService.getOnline(body);

    this.logger.log(`comp_hack /admin/online raw: ${JSON.stringify(response)}`);

    return SuccessResponse.toJson({
      code: 'ONLINE_SUCCESS',
      message: 'Online status retrieved successfully',
      path: '/admin/online',
      data: response,
    });
  }
}
