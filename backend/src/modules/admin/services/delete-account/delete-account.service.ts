import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { AdminDeleteAccountInputDTO } from '../../admin.input';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';

@Injectable()
export class DeleteAccountService {
  private readonly logger = new Logger(DeleteAccountService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(input: AdminDeleteAccountInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Deleting account ${input.username} - requested by ${currentUser.username}`);

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const response = await this.imagineService.deleteAccount({
      ...session,
      username: input.username,
    });

    return SuccessResponse.toJson({
      code: 'DELETE_ACCOUNT_SUCCESS',
      message: 'Account deleted successfully',
      path: '/admin/account/delete',
      data: response,
    });
  }
}
