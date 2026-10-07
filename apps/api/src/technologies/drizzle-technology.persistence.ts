import { Injectable } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
import { technologies } from '../database/schema.js';
import { AdminTechnology, CreateTechnologyDraft, PublicTechnology, TechnologyContentUpdate, TechnologyOrderDirection, TechnologyPersistence, TechnologyStatus } from './technology.persistence.js';
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
  async moveTechnology(id: string, direction: TechnologyOrderDirection): Promise<AdminTechnology[] | undefined> { return this.database.db.transaction(async transaction => { const ordered = await transaction.select(this.adminProjection).from(technologies).orderBy(asc(technologies.displayOrder)); const index = ordered.findIndex(technology => technology.id === id); if (index === -1) return undefined; const neighborIndex = direction === 'up' ? index - 1 : index + 1; if (neighborIndex < 0 || neighborIndex >= ordered.length) return ordered; const technology = ordered[index]; const neighbor = ordered[neighborIndex]; const now = new Date(); await transaction.update(technologies).set({ displayOrder: neighbor.displayOrder, updatedAt: now }).where(eq(technologies.id, technology.id)); await transaction.update(technologies).set({ displayOrder: technology.displayOrder, updatedAt: now }).where(eq(technologies.id, neighbor.id)); return transaction.select(this.adminProjection).from(technologies).orderBy(asc(technologies.displayOrder)); }); }
  private readonly adminProjection = { id: technologies.id, name: technologies.name, category: technologies.category, status: technologies.status, displayOrder: technologies.displayOrder };
}
