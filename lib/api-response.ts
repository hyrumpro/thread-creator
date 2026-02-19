import { NextResponse } from 'next/server';
import { ApiError } from './api-error';

export type ApiResponse<T = any> = {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, any>;
  };
  meta?: {
    retryable?: boolean;
    retryAfter?: number;
  };
};

export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(error: unknown): NextResponse<ApiResponse> {
  console.error('[API Error]', error);

  if (error instanceof ApiError) {
    const response: ApiResponse = {
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    };

    const headers: Record<string, string> = {};

    if (error.code === 'RATE_LIMITED') {
      response.meta = { retryable: true, retryAfter: 60 };
      headers['Retry-After'] = '60';
    }

    if (error.code === 'SERVICE_UNAVAILABLE') {
      response.meta = { retryable: true, retryAfter: 30 };
    }

    return NextResponse.json(response, { status: error.statusCode, headers });
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: {
          message: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred' 
            : error.message,
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
    },
    { status: 500 }
  );
}

export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T>>> {
  return handler().catch(errorResponse);
}
