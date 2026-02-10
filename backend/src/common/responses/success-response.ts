import { HttpStatus } from '@nestjs/common';

export interface SuccessResponseOptions<T> {
  message: string;
  code: string;
  data?: T;
  successCode?: HttpStatus;
  path?: string;
}

export interface PaginatedSuccessResponseOptions<T> {
  message: string;
  code: string;
  data: T[];
  pagination: {
    itemCount: number;
    totalItems?: number;
    itemsPerPage: number;
    totalPages?: number;
    currentPage: number;
  };
}

export class SuccessResponse<T> {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly data?: T,
    public readonly successCode?: HttpStatus,
    public readonly meta?: Record<string, any>,
    public readonly requestId?: string,
  ) {}

  public toJson(): {
    success: boolean;
    message: string;
    code: string;
    successCode: number;
    data?: T;
    meta?: Record<string, any>;
    timestamp: string;
    requestId?: string;
  } {
    return {
      success: true,
      message: this.message,
      code: this.code,
      successCode: this.successCode || HttpStatus.OK,
      data: this.data,
      meta: this.meta,
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
    };
  }

  public static toJson<T>(options: SuccessResponseOptions<T>): {
    success: boolean;
    message: string;
    code: string;
    successCode: number;
    timestamp: string;
    data?: T;
    path?: string;
  } {
    const { message, code, data, successCode = HttpStatus.OK, path } = options;

    return {
      success: true,
      message,
      code,
      successCode,
      data,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  public static toPaginatedJson<T>(options: PaginatedSuccessResponseOptions<T>): {
    success: boolean;
    message: string;
    code: string;
    successCode: number;
    data: T[];
    pagination: {
      itemCount: number;
      totalItems: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
    timestamp: string;
  } {
    const { message, code, data, pagination } = options;

    return {
      success: true,
      message,
      code,
      successCode: HttpStatus.OK,
      data,
      pagination: {
        itemCount: pagination.itemCount ?? data.length,
        totalItems: pagination.totalItems ?? 0,
        itemsPerPage: pagination.itemsPerPage ?? 10,
        totalPages: pagination.totalPages ?? 0,
        currentPage: pagination.currentPage ?? 1,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
