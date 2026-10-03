export type AdminUserRecord = {
  id: string;
  loginIdentifier: string;
  passwordHash: string;
};
export interface AdminAuthPersistence {
  findUserByIdentifier(
    identifier: string,
  ): Promise<AdminUserRecord | undefined>;
  createSession(input: {
    id: string;
    tokenHash: string;
    adminUserId: string;
    expiresAt: Date;
  }): Promise<void>;
  findActiveSession(
    tokenHash: string,
    now: Date,
  ): Promise<{ loginIdentifier: string } | undefined>;
  revokeSession(tokenHash: string): Promise<void>;
}
export const ADMIN_AUTH_PERSISTENCE = Symbol('ADMIN_AUTH_PERSISTENCE');
