import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';

@Injectable()
export class GetPromosService {
  private readonly logger = new Logger(GetPromosService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(currentUser: CurrentUserDTO) {
    this.logger.log(`Getting promos - requested by ${currentUser.username}`);

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const response = await this.imagineService.getPromos(session);

    return SuccessResponse.toJson({
      code: 'GET_PROMOS_SUCCESS',
      message: 'Promos retrieved successfully',
      path: '/admin/promos',
      data: response,
    });
  }
}
