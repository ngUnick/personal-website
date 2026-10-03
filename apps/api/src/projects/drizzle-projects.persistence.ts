import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { projects } from '../database/schema.js';
import { PersistedProject, ProjectsPersistence } from './projects.persistence.js';

@Injectable()
export class DrizzleProjectsPersistence implements ProjectsPersistence {
  constructor(private readonly database: DatabaseService) {}

  async findPublished(): Promise<PersistedProject[]> {
    return this.database.db
      .select({ slug: projects.slug, title: projects.title, summary: projects.summary })
      .from(projects)
      .where(eq(projects.status, 'published'))
      .orderBy(asc(projects.displayOrder));
  }
}
