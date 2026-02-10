import { ImagineService } from '@/common/imagine/imagine.service';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenInputDTO } from './refresh-token.input';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  public constructor(
    private readonly jwtService: JwtService,
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(input: RefreshTokenInputDTO) {
    this.logger.log('Executing refresh token service');

    const decodedToken = await (async () => {
      try {
        return await this.jwtService.verifyAsync<{ username?: string }>(input.refreshToken);
      } catch {
        this.logger.error('Invalid or expired refresh token');
        throw ErrorResponse.toHttpException({
          message: 'Invalid or expired refresh token',
          statusCode: HttpStatus.UNAUTHORIZED,
          code: 'INVALID_REFRESH_TOKEN',
        });
      }
    })();

    if (!decodedToken.username) {
      this.logger.error('Refresh token does not contain username');
      throw ErrorResponse.toHttpException({
        message: 'Invalid refresh token',
        statusCode: HttpStatus.UNAUTHORIZED,
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    const session = await this.compHackAuthService.getSession(decodedToken.username);
    const details = await this.imagineService.getDetails(session);

    if (!details.enabled) {
      throw ErrorResponse.toHttpException({
        message: 'Account disabled',
        statusCode: HttpStatus.FORBIDDEN,
        code: 'ACCOUNT_DISABLED',
      });
    }

    const token = await this.jwtService.signAsync({
      username: details.username,
      email: details.email,
      disp_name: details.disp_name,
      user_level: details.user_level,
      enabled: details.enabled,
    });

    const refreshToken = await this.jwtService.signAsync({
      username: details.username,
    });

    return SuccessResponse.toJson({
      code: 'REFRESH_TOKEN_SUCCESS',
      message: 'Token refreshed successfully',
      path: '/auth/refresh-token',
      data: {
        token,
        refreshToken,
      },
      successCode: HttpStatus.OK,
    });
  }
}
