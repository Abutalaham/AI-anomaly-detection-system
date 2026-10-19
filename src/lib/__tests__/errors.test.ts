import { describe, it, expect } from 'vitest';
import { AppError, ok, err } from '../errors';

describe('AppError & Result', () => {
  it('creates an AppError instance with correct code and name', () => {
    const error = new AppError('Telemetry stream unreachable', 'NETWORK_ERROR');
    expect(error.name).toBe('AppError');
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toBe('Telemetry stream unreachable');
    expect(AppError.is(error)).toBe(true);
  });

  it('correctly discriminates ok and err Result structures', () => {
    const successResult = ok({ pointsCount: 42 });
    expect(successResult.ok).toBe(true);
    if (successResult.ok) {
      expect(successResult.data.pointsCount).toBe(42);
    }

    const failureResult = err(new AppError('Out of bounds', 'DETECTION_ERROR'));
    expect(failureResult.ok).toBe(false);
    if (!failureResult.ok) {
      expect(failureResult.error.code).toBe('DETECTION_ERROR');
    }
  });
});
