import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';

@Injectable()
export class GetAccountsService {
  private readonly logger = new Logger(GetAccountsService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(currentUser: CurrentUserDTO) {
    this.logger.log(`Getting all accounts - requested by ${currentUser.username}`);

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const response = await this.imagineService.getAccounts(session);

    return SuccessResponse.toJson({
      code: 'GET_ACCOUNTS_SUCCESS',
      message: 'Accounts retrieved successfully',
      path: '/admin/accounts',
      data: response,
    });
  }
}
