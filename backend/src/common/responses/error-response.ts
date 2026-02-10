import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorResponseOptions {
  message: string;
  code: string;
  statusCode: HttpStatus;
  error?: string;
  details?: Record<string, any>;
  path?: string;
  requestId?: string;
  validation?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

export class ErrorResponse {
  constructor(
    public readonly message: string,
    public readonly statusCode: HttpStatus,
    public readonly code?: string,
    public readonly error?: string,
    public readonly details?: Record<string, any>,
    public readonly path?: string,
    public readonly requestId?: string,
    public readonly validation?: Array<{
      field: string;
      message: string;
      value?: any;
    }>,
  ) {}

  public static toJson(options: ErrorResponseOptions): {
    success: boolean;
    message: string;
    code: string;
    error: string;
    statusCode: number;
    details?: Record<string, any>;
    timestamp: string;
    path?: string;
    requestId?: string;
    validation?: Array<{ field: string; message: string; value?: any }>;
  } {
    const { message, code, statusCode, error, details, path, requestId, validation } = options;

    const env = process.env.STAGE || process.env.STAGE;
    const isProd = env === 'prod' || env === 'production';

    return {
      success: false,
      message,
      code,
      error: !isProd && error ? error : HttpStatus[statusCode],
      statusCode,
      details,
      timestamp: new Date().toISOString(),
      path,
      requestId,
      validation,
    };
  }

  public static toHttpException(options: ErrorResponseOptions): HttpException {
    const response = ErrorResponse.toJson(options);
    return new HttpException(response, options.statusCode);
  }
}
