import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { credentials } from '../database/schema.js';
import type { AdminCredential, CredentialContentUpdate, CredentialPersistence } from './credential.persistence.js';
@Injectable()
export class DrizzleCredentialPersistence implements CredentialPersistence {
  constructor(private readonly database: DatabaseService) {}
  findForAdmin(): Promise<AdminCredential[]> { return this.database.db.select(this.projection).from(credentials).orderBy(asc(credentials.displayOrder)); }
  async findForAdminById(id: string): Promise<AdminCredential | undefined> { return (await this.database.db.select(this.projection).from(credentials).where(eq(credentials.id, id)).limit(1))[0]; }
  async updateContent(id: string, content: CredentialContentUpdate): Promise<AdminCredential | undefined> { const [credential] = await this.database.db.update(credentials).set({ ...content, updatedAt: new Date() }).where(eq(credentials.id, id)).returning(this.projection); return credential; }
  private readonly projection = { id: credentials.id, name: credentials.name, issuer: credentials.issuer, issuedOn: credentials.issuedOn, status: credentials.status, displayOrder: credentials.displayOrder };
}
