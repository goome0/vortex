import { Inject, Injectable } from '@nestjs/common';
import type { Params } from 'nestjs-pino';
import { PARAMS_PROVIDER_TOKEN, PinoLogger } from 'nestjs-pino';

@Injectable()
export class AppLogger extends PinoLogger {
  private readonly sensitiveFields = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'secret',
    'apiKey',
    'creditCard',
    'cvv',
    'ssn',
    'cpf',
    'cnpj',
  ];

  constructor(@Inject(PARAMS_PROVIDER_TOKEN) params: Params) {
    super(params);
  }

  private getCallerInfo() {
    const e = new Error();
    const stack = e.stack?.toString().split(/\r\n|\n/) ?? [];
    return stack[4]?.replace('at', '')?.trim() ?? '';
  }

  private sanitizeData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      if (this.sensitiveFields.some((field) => lowerKey.includes(field))) {
        sanitized[key] = '***REDACTED***';
      } else if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private buildLogMessage(message: string, data?: unknown, isError = false) {
    const sanitizedData = this.sanitizeData(data);

    if (isError) {
      return { message, error: sanitizedData, context: this.context };
    }

    const caller = this.getCallerInfo();

    const result = sanitizedData
      ? { message, data: sanitizedData, context: this.context, caller }
      : { message, context: this.context, caller };

    return result;
  }

  public log(message: string, data?: unknown): void {
    return this.logger.info(this.buildLogMessage(message, data));
  }

  public error(message: string, data?: unknown): void {
    return this.logger.error(this.buildLogMessage(message, data, true));
  }

  public warn(message: string, data?: unknown): void {
    return this.logger.warn(this.buildLogMessage(message, data));
  }
}
