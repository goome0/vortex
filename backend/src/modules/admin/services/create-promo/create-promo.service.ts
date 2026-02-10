import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { AdminCreatePromoInputDTO } from '../../admin.input';

@Injectable()
export class CreatePromoService {
  private readonly logger = new Logger(CreatePromoService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(input: AdminCreatePromoInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Creating promo ${input.code} - requested by ${currentUser.username}`);

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const response = await this.imagineService.createPromo({
      ...session,
      code: input.code,
      startTime: input.startTime,
      endTime: input.endTime,
      useLimit: input.useLimit,
      limitType: input.limitType,
      items: input.items,
    });

    return SuccessResponse.toJson({
      code: 'CREATE_PROMO_SUCCESS',
      message: 'Promo created successfully',
      path: '/admin/promo/create',
      data: response,
    });
  }
}
