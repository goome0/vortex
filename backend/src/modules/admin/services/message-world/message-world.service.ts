import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { AdminMessageWorldInputDTO } from '../../admin.input';

@Injectable()
export class MessageWorldService {
  private readonly logger = new Logger(MessageWorldService.name);

  public constructor(private readonly imagineService: ImagineService) {}

  public async execute(input: AdminMessageWorldInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Sending message to world ${input.world_id} - requested by ${currentUser.username}`);

    const response = await this.imagineService.messageWorld({
      session_username: currentUser.username,
      challenge: currentUser.challenge,
      world_id: input.world_id,
      message: input.message,
      type: input.type,
      from: input.from,
      mode: input.mode,
      sub_mode: input.sub_mode,
    });

    return SuccessResponse.toJson({
      code: 'MESSAGE_WORLD_SUCCESS',
      message: 'Message sent to world successfully',
      path: '/admin/message-world',
      data: response,
    });
  }
}
