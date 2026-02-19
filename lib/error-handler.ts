import { toast } from 'sonner'

export interface ParsedError {
  message: string
  code?: string
  retryable?: boolean
  retryAfter?: number
}

export function parseApiError(error: unknown): ParsedError {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message)
      if (parsed.error) {
        return {
          message: parsed.error.message,
          code: parsed.error.code,
          retryable: parsed.meta?.retryable,
          retryAfter: parsed.meta?.retryAfter,
        }
      }
    } catch {}

    return { message: error.message }
  }

  if (typeof error === 'object' && error !== null) {
    const anyError = error as any
    
    if (anyError.error?.message) {
      return {
        message: anyError.error.message,
        code: anyError.error.code,
        retryable: anyError.meta?.retryable,
        retryAfter: anyError.meta?.retryAfter,
      }
    }
    
    if (anyError.message) {
      return { message: anyError.message }
    }
  }

  return { message: 'An unexpected error occurred. Please try again.' }
}

export function showErrorToast(error: unknown, title: string = 'Error') {
  const parsed = parseApiError(error)
  
  let description = parsed.message

  if (parsed.retryable) {
    description += parsed.retryAfter 
      ? ` Try again in ${parsed.retryAfter} seconds.`
      : ' Please try again.'
  }

  toast.error(title, { description })
  
  return parsed
}

export function showSuccessToast(message: string, description?: string) {
  toast.success(message, { description })
}

export function showLoadingToast(message: string, description?: string) {
  return toast.loading(message, { description })
}

export function dismissToast(toastId?: string | number) {
  toast.dismiss(toastId)
}

const NETWORK_ERRORS = [
  'Failed to fetch',
  'NetworkError',
  'Network request failed',
  'ERR_NETWORK',
  'ERR_CONNECTION_REFUSED',
  'ERR_CONNECTION_RESET',
  'ERR_CONNECTION_TIMED_OUT',
]

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return NETWORK_ERRORS.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    )
  }
  return false
}

export function getRetryMessage(attempt: number, maxAttempts: number): string {
  return `Retrying... (${attempt}/${maxAttempts})`
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    backoff?: boolean
    shouldRetry?: (error: unknown) => boolean
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = true, shouldRetry = isNetworkError } = options

  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error
      }

      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  throw lastError
}
