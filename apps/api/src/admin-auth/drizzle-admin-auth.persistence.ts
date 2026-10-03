import { Injectable } from '@nestjs/common';
import { and, eq, gt } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { adminSessions, adminUsers } from '../database/schema.js';
import type {
  AdminAuthPersistence,
  AdminUserRecord,
} from './admin-auth.persistence.js';

@Injectable()
export class DrizzleAdminAuthPersistence implements AdminAuthPersistence {
  constructor(private readonly database: DatabaseService) {}
  async findUserByIdentifier(
    loginIdentifier: string,
  ): Promise<AdminUserRecord | undefined> {
    const [user] = await this.database.db
      .select({
        id: adminUsers.id,
        loginIdentifier: adminUsers.loginIdentifier,
        passwordHash: adminUsers.passwordHash,
      })
      .from(adminUsers)
      .where(eq(adminUsers.loginIdentifier, loginIdentifier))
      .limit(1);
    return user;
  }
  async createSession(input: {
    id: string;
    tokenHash: string;
    adminUserId: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.database.db.insert(adminSessions).values(input);
  }
  async findActiveSession(
    tokenHash: string,
    now: Date,
  ): Promise<{ loginIdentifier: string } | undefined> {
    const [session] = await this.database.db
      .select({ loginIdentifier: adminUsers.loginIdentifier })
      .from(adminSessions)
      .innerJoin(adminUsers, eq(adminSessions.adminUserId, adminUsers.id))
      .where(
        and(
          eq(adminSessions.tokenHash, tokenHash),
          gt(adminSessions.expiresAt, now),
        ),
      )
      .limit(1);
    return session;
  }
  async revokeSession(tokenHash: string): Promise<void> {
    await this.database.db
      .delete(adminSessions)
      .where(eq(adminSessions.tokenHash, tokenHash));
  }
}
