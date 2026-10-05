import { Injectable } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
import { experiences } from '../database/schema.js';
import type {
  ExperiencePersistence,
  PersistedExperience,
  AdminPersistedExperience,
  ExperienceContentUpdate,
  ExperiencePublicationStatus,
  CreateExperienceDraft,
} from './experience.persistence.js';

@Injectable()
export class DrizzleExperiencePersistence implements ExperiencePersistence {
  constructor(private readonly database: DatabaseService) {}

  async findPublished(): Promise<PersistedExperience[]> {
    return this.database.db
      .select({
        organization: experiences.organization,
        role: experiences.role,
        summary: experiences.summary,
        startDate: experiences.startDate,
        endDate: experiences.endDate,
      })
      .from(experiences)
      .where(eq(experiences.status, 'published'))
      .orderBy(asc(experiences.displayOrder));
  }

  async findForAdmin(): Promise<AdminPersistedExperience[]> {
    return this.database.db.select(this.adminProjection).from(experiences).orderBy(asc(experiences.displayOrder));
  }

  async findForAdminById(id: string): Promise<AdminPersistedExperience | undefined> {
    return (await this.database.db.select(this.adminProjection).from(experiences).where(eq(experiences.id, id)).limit(1))[0];
  }

  async updateContent(id: string, content: ExperienceContentUpdate): Promise<AdminPersistedExperience | undefined> {
    await this.database.db.update(experiences).set({ ...content, updatedAt: new Date() }).where(eq(experiences.id, id));
    return this.findForAdminById(id);
  }

  async updateStatus(id: string, status: ExperiencePublicationStatus): Promise<AdminPersistedExperience | undefined> {
    await this.database.db.update(experiences).set({ status, updatedAt: new Date() }).where(eq(experiences.id, id));
    return this.findForAdminById(id);
  }

  async createDraft(input: CreateExperienceDraft): Promise<AdminPersistedExperience> {
    return this.database.db.transaction(async (transaction) => {
      const [order] = await transaction.select({ value: sql<number>`coalesce(max(${experiences.displayOrder}), -1)` }).from(experiences);
      const [created] = await transaction.insert(experiences).values({ id: randomUUID(), ...input, status: 'draft', displayOrder: order.value + 1 }).returning(this.adminProjection);
      return created;
    });
  }

  private readonly adminProjection = {
    id: experiences.id,
    organization: experiences.organization,
    role: experiences.role,
    summary: experiences.summary,
    startDate: experiences.startDate,
    endDate: experiences.endDate,
    status: experiences.status,
    displayOrder: experiences.displayOrder,
  };
}
