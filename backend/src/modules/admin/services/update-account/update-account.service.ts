import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { AdminUpdateAccountInputDTO } from '../../admin.input';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';

@Injectable()
export class UpdateAccountService {
  private readonly logger = new Logger(UpdateAccountService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(input: AdminUpdateAccountInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log(`Updating account ${input.username} - requested by ${currentUser.username}`);

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const response = await this.imagineService.updateAccount({
      ...session,
      username: input.username,
      password: input.password,
      disp_name: input.disp_name,
      cp: input.cp,
      ticket_count: input.ticket_count,
      user_level: input.user_level,
      enabled: input.enabled,
    });

    return SuccessResponse.toJson({
      code: 'UPDATE_ACCOUNT_SUCCESS',
      message: 'Account updated successfully',
      path: '/admin/account/update',
      data: response,
    });
  }
}
