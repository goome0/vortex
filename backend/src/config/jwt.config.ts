import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.getOrThrow('JWT_SECRET'),
  signOptions: {
    expiresIn: configService.getOrThrow('JWT_EXPIRES_IN'),
  },
});
