import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { AdminDeletePromoInputDTO } from '../../admin.input';

@Injectable()
export class DeletePromoService {
  private readonly logger = new Logger(DeletePromoService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(input: AdminDeletePromoInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Deleting promo ${input.code} - requested by ${currentUser.username}`);

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const response = await this.imagineService.deletePromo({
      ...session,
      code: input.code,
    });

    return SuccessResponse.toJson({
      code: 'DELETE_PROMO_SUCCESS',
      message: 'Promo deleted successfully',
      path: '/admin/promo/delete',
      data: response,
    });
  }
}
