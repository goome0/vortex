import { ImagineService } from '@/common/imagine/imagine.service';
import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpInputDTO } from './sign-up.input';

@Injectable()
export class SignUpService {
  private readonly logger = new Logger(SignUpService.name);

  public constructor(
    private readonly jwtService: JwtService,
    private readonly imagineService: ImagineService,
  ) {}

  public async execute(input: SignUpInputDTO) {
    this.logger.log('Executing sign up service');

    const result = await this.imagineService.register({
      username: input.username,
      email: input.email,
      password: input.password,
    });

    if (result.error && result.error !== 'Success') {
      this.logger.error('Failed to register on Imagine', { error: result.error });
      throw ErrorResponse.toHttpException({
        message: result.error,
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'REGISTER_FAILED',
      });
    }

    const token = await this.jwtService.signAsync({
      username: input.username,
      email: input.email,
    });

    const refreshToken = await this.jwtService.signAsync({
      username: input.username,
    });

    return SuccessResponse.toJson({
      code: 'SIGN_UP_SUCCESS',
      message: 'Successfully registered',
      path: '/auth/sign-up',
      data: {
        username: input.username,
        email: input.email,
        token,
        refreshToken,
      },
      successCode: HttpStatus.CREATED,
    });
  }
}
