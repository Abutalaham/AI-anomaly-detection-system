export type ErrorCode =
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'DETECTION_ERROR'
  | 'INGEST_ERROR'
  | 'STORAGE_ERROR'
  | 'NOT_FOUND'
  | 'UNKNOWN_ERROR';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly cause?: unknown;
  public readonly isAppError = true;

  constructor(message: string, code: ErrorCode = 'UNKNOWN_ERROR', cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static is(error: unknown): error is AppError {
    return typeof error === 'object' && error !== null && 'isAppError' in error;
  }
}

export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

export function err<E = AppError>(error: E): Result<never, E> {
  return { ok: false, error };
}
