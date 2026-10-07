import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { technologies } from '../database/schema.js';
import { AdminTechnology, PublicTechnology, TechnologyContentUpdate, TechnologyPersistence, TechnologyStatus } from './technology.persistence.js';
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
  private readonly adminProjection = { id: technologies.id, name: technologies.name, category: technologies.category, status: technologies.status, displayOrder: technologies.displayOrder };
}
