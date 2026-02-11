import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { AdminMessageWorldInputDTO } from '../../admin.input';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';

@Injectable()
export class MessageWorldService {
  private readonly logger = new Logger(MessageWorldService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(input: AdminMessageWorldInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Sending message to world ${input.world_id} - requested by ${currentUser.username}`);

    // `comp_hack` requires a valid world ID (active world server).
    // For convenience, we treat `world_id = 0` as "broadcast to all active worlds",
    // using `/admin/online` (counts) to discover world IDs.
    const worldId = Number(input.world_id);

    const sendToWorld = async (world_id: number) => {
      const session = await this.compHackAuthService.getSession(currentUser.username);
      return this.imagineService.messageWorld({
        ...session,
        world_id,
        message: input.message,
        type: input.type,
        from: input.from,
        mode: input.mode,
        sub_mode: input.sub_mode,
      });
    };

    const response = await (async () => {
      if (worldId !== 0) {
        return sendToWorld(worldId);
      }

      const session = await this.compHackAuthService.getSession(currentUser.username);
      const online = await this.imagineService.getOnline(session);

      // Some comp_hack setups use `world_id = 0` as a real world ID.
      // In that case, treat 0 as a normal world target (not broadcast).
      const hasWorld0 = (online.counts ?? []).some((c) => Number(c.world_id) === 0);
      if (hasWorld0) {
        return sendToWorld(0);
      }

      const worldIds = (online.counts ?? [])
        .map((c) => Number(c.world_id))
        .filter((id) => Number.isFinite(id) && id > 0);

      if (worldIds.length === 0) {
        return {
          error: 'No active world servers found',
          challenge: online.challenge,
        };
      }

      const results = await Promise.all(worldIds.map(async (id) => ({ world_id: id, result: await sendToWorld(id) })));
      return {
        error: 'Success',
        worlds: results,
        challenge: online.challenge,
      };
    })();

    return SuccessResponse.toJson({
      code: 'MESSAGE_WORLD_SUCCESS',
      message: 'Message sent to world successfully',
      path: '/admin/message-world',
      data: response,
    });
  }
}
