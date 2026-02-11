import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CurrentUserDTO } from '../dto/current-user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  public async validate(payload: {
    username?: string;
    email?: string;
    disp_name?: string;
    user_level?: number;
    enabled?: boolean;
    challenge?: string;
    permissions?: string[];
    typ?: string;
  }): Promise<CurrentUserDTO> {
    if (!payload.username) {
      throw new UnauthorizedException('Invalid token');
    }

    // If token has a `typ` claim, it must be an access token.
    // (Backward compatible with older tokens without `typ`.)
    if (payload.typ && payload.typ !== 'access') {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      id: payload.username,
      username: payload.username,
      email: payload.email ?? '',
      disp_name: payload.disp_name ?? '',
      user_level: payload.user_level ?? 0,
      enabled: payload.enabled ?? false,
      challenge: payload.challenge ?? '',
      permissions: payload.permissions,
    };
  }
}
