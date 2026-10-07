import { Injectable } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
import { credentials } from '../database/schema.js';
import type { AdminCredential, CreateCredentialDraft, CredentialContentUpdate, CredentialPersistence } from './credential.persistence.js';
@Injectable()
export class DrizzleCredentialPersistence implements CredentialPersistence {
  constructor(private readonly database: DatabaseService) {}
  findForAdmin(): Promise<AdminCredential[]> { return this.database.db.select(this.projection).from(credentials).orderBy(asc(credentials.displayOrder)); }
  async findForAdminById(id: string): Promise<AdminCredential | undefined> { return (await this.database.db.select(this.projection).from(credentials).where(eq(credentials.id, id)).limit(1))[0]; }
  async createDraft(input: CreateCredentialDraft): Promise<AdminCredential> { return this.database.db.transaction(async transaction => { const [order] = await transaction.select({ value: sql<number>`coalesce(max(${credentials.displayOrder}), -1)` }).from(credentials); const [credential] = await transaction.insert(credentials).values({ id: randomUUID(), ...input, status: 'draft', displayOrder: order.value + 1 }).returning(this.projection); return credential; }); }
  async updateContent(id: string, content: CredentialContentUpdate): Promise<AdminCredential | undefined> { const [credential] = await this.database.db.update(credentials).set({ ...content, updatedAt: new Date() }).where(eq(credentials.id, id)).returning(this.projection); return credential; }
  async updateStatus(id: string, status: AdminCredential['status']): Promise<AdminCredential | undefined> { const [credential] = await this.database.db.update(credentials).set({ status, updatedAt: new Date() }).where(eq(credentials.id, id)).returning(this.projection); return credential; }
  private readonly projection = { id: credentials.id, name: credentials.name, issuer: credentials.issuer, issuedOn: credentials.issuedOn, status: credentials.status, displayOrder: credentials.displayOrder };
}
