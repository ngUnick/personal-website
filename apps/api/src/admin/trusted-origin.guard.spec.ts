import type { ExecutionContext } from '@nestjs/common';
import { TrustedOriginGuard } from './trusted-origin.guard.js';

const contextWithOrigin = (origin?: string) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers: { origin } }),
    }),
  }) as ExecutionContext;

describe('TrustedOriginGuard', () => {
  const initialNodeEnv = process.env.NODE_ENV;
  const initialTrustedOrigin = process.env.TRUSTED_WEB_ORIGIN;

  afterEach(() => {
    if (initialNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = initialNodeEnv;
    if (initialTrustedOrigin === undefined) delete process.env.TRUSTED_WEB_ORIGIN;
    else process.env.TRUSTED_WEB_ORIGIN = initialTrustedOrigin;
  });

  it('uses the localhost fallback outside production', () => {
    process.env.NODE_ENV = 'test';
    delete process.env.TRUSTED_WEB_ORIGIN;

    expect(new TrustedOriginGuard().canActivate(contextWithOrigin('http://localhost:4200'))).toBe(true);
  });

  it('fails closed in production without an explicitly configured trusted origin', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.TRUSTED_WEB_ORIGIN;

    expect(() => new TrustedOriginGuard().canActivate(contextWithOrigin('http://localhost:4200'))).toThrow('A trusted origin is required.');
  });

  it('uses the configured trusted origin in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.TRUSTED_WEB_ORIGIN = 'https://portfolio.example';

    expect(new TrustedOriginGuard().canActivate(contextWithOrigin('https://portfolio.example'))).toBe(true);
  });
});
