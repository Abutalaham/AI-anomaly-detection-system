import { describe, it, expect } from 'vitest';
import { signInSchema, signUpSchema } from '../schemas/auth.schema';

describe('Auth Validation Schemas', () => {
  describe('signInSchema', () => {
    it('passes with valid email and password', () => {
      const res = signInSchema.safeParse({
        email: 'operator@sentinel.dev',
        password: 'securePassword123',
      });
      expect(res.success).toBe(true);
    });

    it('rejects invalid email formats', () => {
      const res = signInSchema.safeParse({
        email: 'not-an-email',
        password: 'securePassword123',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toMatch(/valid email/i);
      }
    });

    it('rejects passwords shorter than 6 characters', () => {
      const res = signInSchema.safeParse({
        email: 'operator@sentinel.dev',
        password: '123',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toMatch(/at least 6 characters/i);
      }
    });
  });

  describe('signUpSchema', () => {
    it('accepts valid credentials with optional displayName', () => {
      const res = signUpSchema.safeParse({
        email: 'operator@sentinel.dev',
        password: 'securePassword123',
        displayName: 'Lead Operator',
      });
      expect(res.success).toBe(true);
    });

    it('rejects displayName under 2 characters if provided', () => {
      const res = signUpSchema.safeParse({
        email: 'operator@sentinel.dev',
        password: 'securePassword123',
        displayName: 'A',
      });
      expect(res.success).toBe(false);
    });
  });
});
