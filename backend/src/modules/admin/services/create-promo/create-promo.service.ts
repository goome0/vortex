import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { CompHackEntities } from '@/database/entities';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminCreatePromoInputDTO } from '../../admin.input';

@Injectable()
export class CreatePromoService {
  private readonly logger = new Logger(CreatePromoService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
    @InjectRepository(CompHackEntities.Promo)
    private readonly promoRepository: Repository<CompHackEntities.Promo>,
  ) {}

  public async execute(input: AdminCreatePromoInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Creating promo ${input.code} - requested by ${currentUser.username}`);

    const existing = await this.promoRepository
      .createQueryBuilder('p')
      .where('LOWER(p.code) = LOWER(:code)', { code: input.code })
      .getCount();

    if (existing > 0) {
      throw ErrorResponse.toHttpException({
        message: 'Promo code already exists. Choose a unique code.',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'PROMO_CODE_EXISTS',
      });
    }

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
