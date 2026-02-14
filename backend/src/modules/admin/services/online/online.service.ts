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

    // comp_hack expects each target as { name: string, type: 'account'|'character' } - ensure proper format
    const targets: Array<{ name: string; type: 'account' | 'character'; world_id?: number }> = [];
    for (const t of rawTargets) {
      if (!t || typeof (t as { name?: unknown }).name !== 'string' || typeof (t as { type?: unknown }).type !== 'string') continue;
      const name = String((t as { name: string }).name).trim();
      if (!name) continue;
      const typeStr = String((t as { type: string }).type).trim();
      const type = typeStr === 'account' || typeStr === 'character' ? typeStr : 'account';
      const world_id = (t as { world_id?: number }).world_id;
      targets.push({ name, type, world_id });
    }

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
