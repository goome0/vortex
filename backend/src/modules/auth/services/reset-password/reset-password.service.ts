import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { ImagineService } from '@/common/imagine/imagine.service';
import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ResetPasswordInputDTO } from './reset-password.input';

@Injectable()
export class ResetPasswordService {
  private readonly logger = new Logger(ResetPasswordService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(input: ResetPasswordInputDTO, currentUser: CurrentUserDTO) {
    this.logger.log('Executing reset password service');

    const session = await this.compHackAuthService.getSession(currentUser.username);

    const result = await this.imagineService.changePassword({
      ...session,
      password: input.newPassword,
    });

    if (result.error !== 'Success') {
      this.logger.error('Failed to change password', { error: result.error });
      throw ErrorResponse.toHttpException({
        message: result.error,
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'CHANGE_PASSWORD_FAILED',
      });
    }

    return SuccessResponse.toJson({
      code: 'RESET_PASSWORD_SUCCESS',
      message: 'Password updated successfully',
      path: '/auth/reset-password',
      successCode: HttpStatus.OK,
    });
  }
}
