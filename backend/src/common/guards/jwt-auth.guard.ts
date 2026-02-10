import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/is-public-route.decorator';
import { CurrentUserDTO } from '../dto/current-user.dto';
import { ErrorResponse } from '../responses/error-response';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  public canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  public handleRequest<TUser = CurrentUserDTO>(
    err: Error | null | undefined,
    user: TUser | false | null | undefined,
    info: Error | string | undefined,
    context?: ExecutionContext,
    status?: number,
  ): TUser {
    if (err || !user) {
      throw ErrorResponse.toHttpException({
        message: 'Token inválido ou expirado',
        statusCode: HttpStatus.UNAUTHORIZED,
        code: 'UNAUTHORIZED',
      });
    }
    return user;
  }
}
