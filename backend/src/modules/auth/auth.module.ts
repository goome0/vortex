import { JwtStrategy } from '@/common/strategies/jwt.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { GetProfileModule } from './services/get-profile/get-profile.module';
import { RefreshTokenModule } from './services/refresh-token/refresh-token.module';
import { ResetPasswordModule } from './services/reset-password/reset-password.module';
import { SignInModule } from './services/sign-in/sign-in.module';
import { SignUpModule } from './services/sign-up/sign-up.module';

@Module({
  imports: [PassportModule, SignInModule, SignUpModule, RefreshTokenModule, GetProfileModule, ResetPasswordModule],
  controllers: [AuthController],
  providers: [JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}
