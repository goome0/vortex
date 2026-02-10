import { CurrentUser } from '@/common/decorators';
import { IsPublicRoute } from '@/common/decorators/is-public-route.decorator';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { GetProfileService } from './services/get-profile/get-profile.service';
import { RefreshTokenInputDTO } from './services/refresh-token/refresh-token.input';
import { RefreshTokenService } from './services/refresh-token/refresh-token.service';
import { ResetPasswordInputDTO } from './services/reset-password/reset-password.input';
import { ResetPasswordService } from './services/reset-password/reset-password.service';
import { SignInInputDTO } from './services/sign-in/sign-in.input';
import { SignInService } from './services/sign-in/sign-in.service';
import { SignUpInputDTO } from './services/sign-up/sign-up.input';
import { SignUpService } from './services/sign-up/sign-up.service';

@Controller('auth')
export class AuthController {
  public constructor(
    private readonly signInService: SignInService,
    private readonly signUpService: SignUpService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly getProfileService: GetProfileService,
    private readonly resetPasswordService: ResetPasswordService,
  ) {}

  @Post('sign-in')
  @IsPublicRoute()
  public async signIn(@Body() input: SignInInputDTO) {
    return this.signInService.execute(input);
  }

  @Post('sign-up')
  @IsPublicRoute()
  public async signUp(@Body() input: SignUpInputDTO) {
    return this.signUpService.execute(input);
  }

  @Post('refresh-token')
  @IsPublicRoute()
  public async refreshToken(@Body() input: RefreshTokenInputDTO) {
    return this.refreshTokenService.execute(input);
  }

  @Get('profile')
  public async getProfile(@CurrentUser() currentUser: CurrentUserDTO) {
    return this.getProfileService.execute(currentUser);
  }

  @Post('reset-password')
  public async resetPassword(@Body() input: ResetPasswordInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.resetPasswordService.execute(input, currentUser);
  }
}
