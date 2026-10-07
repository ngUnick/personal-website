import { Injectable } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
import { technologies } from '../database/schema.js';
import { AdminTechnology, CreateTechnologyDraft, PublicTechnology, TechnologyContentUpdate, TechnologyPersistence, TechnologyStatus } from './technology.persistence.js';
@Injectable()
export class DrizzleTechnologyPersistence implements TechnologyPersistence {
  constructor(private readonly database: DatabaseService) {}
  findPublished(): Promise<PublicTechnology[]> {
    return this.database.db.select({ name: technologies.name, category: technologies.category }).from(technologies).where(eq(technologies.status, 'published')).orderBy(asc(technologies.displayOrder));
  }
  findForAdmin(): Promise<AdminTechnology[]> { return this.database.db.select(this.adminProjection).from(technologies).orderBy(asc(technologies.displayOrder)); }
  async findForAdminById(id: string): Promise<AdminTechnology | undefined> { return (await this.database.db.select(this.adminProjection).from(technologies).where(eq(technologies.id, id)).limit(1))[0]; }
  async updateContent(id: string, content: TechnologyContentUpdate): Promise<AdminTechnology | undefined> { const [technology] = await this.database.db.update(technologies).set({ ...content, updatedAt: new Date() }).where(eq(technologies.id, id)).returning(this.adminProjection); return technology; }
  async updateStatus(id: string, status: TechnologyStatus): Promise<AdminTechnology | undefined> { const [technology] = await this.database.db.update(technologies).set({ status, updatedAt: new Date() }).where(eq(technologies.id, id)).returning(this.adminProjection); return technology; }
  async createDraft(input: CreateTechnologyDraft): Promise<AdminTechnology> { return this.database.db.transaction(async transaction => { const [order] = await transaction.select({ value: sql<number>`coalesce(max(${technologies.displayOrder}), -1)` }).from(technologies); const [created] = await transaction.insert(technologies).values({ id: randomUUID(), ...input, status: 'draft', displayOrder: order.value + 1 }).returning(this.adminProjection); return created; }); }
  private readonly adminProjection = { id: technologies.id, name: technologies.name, category: technologies.category, status: technologies.status, displayOrder: technologies.displayOrder };
}
