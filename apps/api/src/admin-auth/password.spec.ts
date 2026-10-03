import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';

describe('password hashing', () => {
  it('verifies the correct password without retaining plaintext', async () => {
    const hash = await hashPassword('development-only-password');
    await expect(
      verifyPassword('development-only-password', hash),
    ).resolves.toBe(true);
    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false);
    expect(hash).not.toContain('development-only-password');
  });
});
