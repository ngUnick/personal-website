import { Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { projects } from '../database/schema.js';
import {
  PersistedProject,
  ProjectsPersistence,
} from './projects.persistence.js';

@Injectable()
export class DrizzleProjectsPersistence implements ProjectsPersistence {
  constructor(private readonly database: DatabaseService) {}

  async findPublished(): Promise<PersistedProject[]> {
    return this.database.db
      .select({
        slug: projects.slug,
        title: projects.title,
        summary: projects.summary,
      })
      .from(projects)
      .where(eq(projects.status, 'published'))
      .orderBy(asc(projects.displayOrder));
  }

  async findFeaturedPublished(): Promise<PersistedProject[]> {
    return this.database.db
      .select({
        slug: projects.slug,
        title: projects.title,
        summary: projects.summary,
      })
      .from(projects)
      .where(and(eq(projects.status, 'published'), eq(projects.featured, true)))
      .orderBy(asc(projects.displayOrder));
  }

  async findPublishedBySlug(
    slug: string,
  ): Promise<PersistedProject | undefined> {
    const [project] = await this.database.db
      .select({
        slug: projects.slug,
        title: projects.title,
        summary: projects.summary,
      })
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.status, 'published')))
      .limit(1);

    return project;
  }

  async findForAdmin() {
    return this.database.db
      .select({ slug: projects.slug, title: projects.title, summary: projects.summary, status: projects.status, featured: projects.featured, displayOrder: projects.displayOrder })
      .from(projects)
      .orderBy(asc(projects.displayOrder));
  }

  async updateFeatured(slug: string, featured: boolean) {
    const [project] = await this.database.db
      .update(projects)
      .set({ featured, updatedAt: new Date() })
      .where(eq(projects.slug, slug))
      .returning({ slug: projects.slug, title: projects.title, summary: projects.summary, status: projects.status, featured: projects.featured, displayOrder: projects.displayOrder });
    return project;
  }
}
