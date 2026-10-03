import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { experiences } from '../database/schema.js';
import type {
  ExperiencePersistence,
  PersistedExperience,
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
}
