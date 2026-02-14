import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { AdminPostItemsInputDTO } from '../../admin.input';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { expandProductsForApi, normalizeProducts } from '../../utils/product-quantity.util';

@Injectable()
export class PostItemsService {
  private readonly logger = new Logger(PostItemsService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(input: AdminPostItemsInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Posting items to ${input.username} - requested by ${currentUser.username}`);

    const normalized = normalizeProducts(input.products);
    if (normalized.length === 0) {
      throw new (await import('@nestjs/common')).BadRequestException('At least one valid product is required');
    }
    const expanded = expandProductsForApi(normalized);

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const response = await this.imagineService.postItems({
      ...session,
      username: input.username,
      cp: input.cp,
      products: expanded,
    });

    return SuccessResponse.toJson({
      code: 'POST_ITEMS_SUCCESS',
      message: 'Items posted successfully',
      path: '/admin/post-items',
      data: response,
    });
  }
}
