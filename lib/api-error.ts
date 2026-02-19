export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message: string, details?: Record<string, any>) {
    return new ApiError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Authentication required') {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Access denied') {
    return new ApiError(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string, details?: Record<string, any>) {
    return new ApiError(message, 409, 'CONFLICT', details);
  }

  static tooManyRequests(message: string = 'Too many requests. Please try again later.') {
    return new ApiError(message, 429, 'RATE_LIMITED');
  }

  static internal(message: string = 'An unexpected error occurred') {
    return new ApiError(message, 500, 'INTERNAL_ERROR');
  }

  static serviceUnavailable(service: string) {
    return new ApiError(`${service} is temporarily unavailable. Please try again.`, 503, 'SERVICE_UNAVAILABLE');
  }
}

export function handleSupabaseError(error: any): ApiError {
  const message = error?.message || 'Database operation failed';
  const code = error?.code;

  if (code === 'PGRST301' || message.includes('JWT')) {
    return ApiError.unauthorized('Your session has expired. Please sign in again.');
  }

  if (code === '23505') {
    if (message.includes('username')) {
      return ApiError.conflict('This username is already taken.');
    }
    if (message.includes('email')) {
      return ApiError.conflict('This email is already registered.');
    }
    return ApiError.conflict('This record already exists.');
  }

  if (code === '23503') {
    return ApiError.badRequest('Referenced record not found.');
  }

  if (code === '42501' || message.includes('policy')) {
    return ApiError.forbidden('You do not have permission to perform this action.');
  }

  if (message.includes('Rate limit')) {
    return ApiError.tooManyRequests(message);
  }

  if (message.includes('Profile not found')) {
    return ApiError.notFound('User profile not found. Please complete your profile.');
  }

  return new ApiError(message, 500, code);
}

export function handleStripeError(error: any): ApiError {
  const message = error?.message || 'Payment operation failed';
  const code = error?.code || error?.type;

  switch (code) {
    case 'card_declined':
      return ApiError.badRequest('Your card was declined. Please try a different payment method.');
    case 'insufficient_funds':
      return ApiError.badRequest('Insufficient funds. Please try a different payment method.');
    case 'expired_card':
      return ApiError.badRequest('Your card has expired. Please use a valid card.');
    case 'incorrect_cvc':
      return ApiError.badRequest('Your card\'s security code is incorrect.');
    case 'processing_error':
      return ApiError.badRequest('An error occurred while processing your card. Please try again.');
    case 'rate_limit':
      return ApiError.tooManyRequests('Too many payment attempts. Please wait before trying again.');
    case 'api_connection_error':
    case 'api_error':
      return ApiError.serviceUnavailable('Payment service');
    default:
      return new ApiError(message, 500, code);
  }
}

export function handleCloudinaryError(error: any): ApiError {
  const message = error?.message || 'Upload failed';

  if (message.includes('File size')) {
    return ApiError.badRequest('File is too large. Maximum size is 10MB.');
  }

  if (message.includes('invalid') || message.includes('format')) {
    return ApiError.badRequest('Invalid file format. Please use JPEG, PNG, or GIF.');
  }

  return ApiError.serviceUnavailable('Image upload service');
}
