import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { AdminPostItemsInputDTO } from '../../admin.input';

@Injectable()
export class PostItemsService {
  private readonly logger = new Logger(PostItemsService.name);

  public constructor(private readonly imagineService: ImagineService) {}

  public async execute(input: AdminPostItemsInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Posting items to ${input.username} - requested by ${currentUser.username}`);

    const response = await this.imagineService.postItems({
      session_username: currentUser.username,
      challenge: currentUser.challenge,
      username: input.username,
      cp: input.cp,
      products: input.products,
    });

    return SuccessResponse.toJson({
      code: 'POST_ITEMS_SUCCESS',
      message: 'Items posted successfully',
      path: '/admin/post-items',
      data: response,
    });
  }
}
