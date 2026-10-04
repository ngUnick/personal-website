import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { ADMIN_AUTH_PERSISTENCE } from './admin-auth.persistence.js';
import type { AdminAuthPersistence } from './admin-auth.persistence.js';
import { verifyPassword } from './password.js';

export const sessionCookieName = 'personal_website_admin_session';
const sessionLifetimeMs = 8 * 60 * 60 * 1000;
const unknownUserPasswordHash =
  'scrypt$MDEyMzQ1Njc4OWFiY2RlZg==$KNEt9AC6Cnn7T7Xj9VuH7TBNiYuYAFL0YQP62p+rUByDS7dbkfjH1lhamsRLLgaHlymVrU4t0U7Xvu+cBnr36g==';
const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('base64url');

@Injectable()
export class AdminAuthService {
  constructor(
    @Inject(ADMIN_AUTH_PERSISTENCE)
    private readonly persistence: AdminAuthPersistence,
  ) {}
  async login(
    loginIdentifier: string,
    password: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    const user = await this.persistence.findUserByIdentifier(loginIdentifier);
    const passwordMatches = await verifyPassword(
      password,
      user?.passwordHash ?? unknownUserPasswordHash,
    );
    if (!user || !passwordMatches)
      throw new UnauthorizedException('Invalid credentials.');
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + sessionLifetimeMs);
    await this.persistence.createSession({
      id: randomUUID(),
      tokenHash: hashToken(token),
      adminUserId: user.id,
      expiresAt,
    });
    return { token, expiresAt };
  }
  async getCurrent(
    token: string | undefined,
  ): Promise<{ authenticated: boolean; loginIdentifier?: string }> {
    if (!token) return { authenticated: false };
    const session = await this.persistence.findActiveSession(
      hashToken(token),
      new Date(),
    );
    return session
      ? { authenticated: true, loginIdentifier: session.loginIdentifier }
      : { authenticated: false };
  }

  async requireAuthenticated(token: string | undefined): Promise<void> {
    const session = await this.getCurrent(token);
    if (!session.authenticated) throw new UnauthorizedException();
  }
  async logout(token: string | undefined): Promise<void> {
    if (token) await this.persistence.revokeSession(hashToken(token));
  }
}
