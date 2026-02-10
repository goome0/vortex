import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorResponse } from '@/common/responses/error-response';

@Injectable()
export class ServerControlGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const enabled = process.env.SERVER_CONTROL_ENABLED === 'true';
    if (!enabled) {
      throw ErrorResponse.toHttpException({
        message: 'Server control is disabled',
        statusCode: HttpStatus.NOT_IMPLEMENTED,
        code: 'SERVER_CONTROL_DISABLED',
      });
    }

    const token = process.env.SERVER_CONTROL_TOKEN;
    if (!token) {
      throw ErrorResponse.toHttpException({
        message: 'Server control is not configured',
        statusCode: HttpStatus.NOT_IMPLEMENTED,
        code: 'SERVER_CONTROL_NOT_CONFIGURED',
      });
    }

    const request = context.switchToHttp().getRequest<{ headers?: Record<string, string | string[] | undefined> }>();
    const headerValue = request.headers?.['x-server-control-token'];
    const provided =
      typeof headerValue === 'string'
        ? headerValue
        : Array.isArray(headerValue)
          ? headerValue[0]
          : undefined;

    if (!provided || provided !== token) {
      throw ErrorResponse.toHttpException({
        message: 'Invalid server control token',
        statusCode: HttpStatus.UNAUTHORIZED,
        code: 'SERVER_CONTROL_UNAUTHORIZED',
      });
    }

    return true;
  }
}

