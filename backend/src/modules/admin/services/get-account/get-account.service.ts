import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { AdminGetAccountInputDTO } from '../../admin.input';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';

@Injectable()
export class GetAccountService {
  private readonly logger = new Logger(GetAccountService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(input: AdminGetAccountInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Getting account ${input.username} - requested by ${currentUser.username}`);

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const response = await this.imagineService.getAccount({
      ...session,
      username: input.username,
    });

    return SuccessResponse.toJson({
      code: 'GET_ACCOUNT_SUCCESS',
      message: 'Account retrieved successfully',
      path: '/admin/account',
      data: response,
    });
  }
}
