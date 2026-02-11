import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus() as HttpStatus;
      const exceptionResponse = exception.getResponse() as unknown;

      if (this.isValidationError(exceptionResponse, status)) {
        type ExceptionResponseShape = { message?: unknown };
        const er =
          typeof exceptionResponse === 'object' && exceptionResponse !== null
            ? (exceptionResponse as ExceptionResponseShape)
            : undefined;
        const messages = Array.isArray(er?.message)
          ? (er?.message as string[])
          : [typeof er?.message === 'string' ? er?.message : 'Validation error'];

        response.status(status).json({
          success: false,
          code: 'INPUT_VALIDATION',
          message: messages,
          statusCode: status,
        });
        return;
      }

      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        ('success' in exceptionResponse || 'code' in exceptionResponse)
      ) {
        response.status(status).json(exceptionResponse);
        return;
      }

      type ExceptionResponseShape = { message?: unknown };
      const er =
        typeof exceptionResponse === 'object' && exceptionResponse !== null
          ? (exceptionResponse as ExceptionResponseShape)
          : undefined;
      const safeMessageFromResponse = typeof er?.message === 'string' ? er.message : undefined;
      message = safeMessageFromResponse ?? exception.message;
    }

    if (process.env.STAGE !== 'prod') {
      this.logger.error(
        `HTTP Status: ${status} Error Message: ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : undefined,
        `${request.method} ${request.url}`,
      );
    }

    response.status(status).json({
      success: false,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private isValidationError(exceptionResponse: unknown, status: HttpStatus): boolean {
    return (
      status === HttpStatus.BAD_REQUEST &&
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      (Array.isArray((exceptionResponse as { message?: unknown }).message) ||
        ((exceptionResponse as { error?: unknown; message?: unknown }).error === 'Bad Request' &&
          (exceptionResponse as { message?: unknown }).message !== undefined))
    );
  }
}
