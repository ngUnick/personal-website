import { describe, expect, it } from 'vitest';
import {
  clearedSessionCookie,
  sessionCookie,
} from './admin-auth.controller.js';

describe('admin session cookies', () => {
  it('marks production session cookies as secure with a positive lifetime', () => {
    const cookie = sessionCookie(
      'opaque-token',
      new Date(Date.now() + 60_000),
      'production',
    );

    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Max-Age=');
    expect(cookie).toContain('Secure');
  });

  it('clears the production cookie using the same security attributes', () => {
    expect(clearedSessionCookie('production')).toContain('Max-Age=0');
    expect(clearedSessionCookie('production')).toContain('Secure');
  });
});
