import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { experiences } from '../database/schema.js';
import type {
  ExperiencePersistence,
  PersistedExperience,
  AdminPersistedExperience,
  ExperienceContentUpdate,
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
