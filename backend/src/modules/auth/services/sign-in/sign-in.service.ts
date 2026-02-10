import { ImagineService } from '@/common/imagine/imagine.service';
import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isAxiosError } from 'axios';
import { createHash } from 'crypto';
import { SignInInputDTO } from './sign-in.input';

@Injectable()
export class SignInService {
  private readonly logger = new Logger(SignInService.name);

  public constructor(
    private readonly jwtService: JwtService,
    private readonly imagineService: ImagineService,
  ) {}

  public async execute(input: SignInInputDTO) {
    this.logger.log('Executing sign in service');

    const username = input.username.trim().toLowerCase();

    const challengeResponse = await this.imagineService.getChallenge({
      username,
    });

    if (!challengeResponse.challenge) {
      this.logger.error('User not found', { username });
      throw ErrorResponse.toHttpException({
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
        code: 'USER_NOT_FOUND',
      });
    }

    // comp_hack WebAPI auth flow:
    // password_hash = sha512(password + salt)
    // challenge_reply = sha512(password_hash + server_challenge)
    const passwordHash = createHash('sha512')
      .update(`${input.password}${challengeResponse.salt}`)
      .digest('hex');

    const challengeReply = createHash('sha512')
      .update(`${passwordHash}${challengeResponse.challenge}`)
      .digest('hex');

    const details = await (async () => {
      try {
        return await this.imagineService.getDetails({
          session_username: username,
          challenge: challengeReply,
        });
      } catch (error: unknown) {
        if (isAxiosError(error) && error.response?.status === 401) {
          throw ErrorResponse.toHttpException({
            message: 'Invalid username or password',
            statusCode: HttpStatus.UNAUTHORIZED,
            code: 'INVALID_CREDENTIALS',
          });
        }
        throw error;
      }
    })();

    if (!details.enabled) {
      this.logger.error('Account disabled', { username });
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
      challenge: details.challenge,
    });

    const refreshToken = await this.jwtService.signAsync({
      username: details.username,
    });

    return SuccessResponse.toJson({
      code: 'SIGN_IN_SUCCESS',
      message: 'Successfully signed in',
      path: '/auth/sign-in',
      data: {
        username: details.username,
        disp_name: details.disp_name,
        email: details.email,
        user_level: details.user_level,
        cp: details.cp,
        ticket_count: details.ticket_count,
        token,
        refreshToken,
      },
      successCode: HttpStatus.OK,
    });
  }
}
