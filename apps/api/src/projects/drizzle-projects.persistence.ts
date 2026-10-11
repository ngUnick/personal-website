import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { and, asc, eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { projects } from '../database/schema.js';
import {
  PersistedProject,
  PersistedProjectDetail,
  ProjectOrderDirection,
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
  ): Promise<PersistedProjectDetail | undefined> {
    const [project] = await this.database.db
      .select({
        slug: projects.slug,
        title: projects.title,
        summary: projects.summary,
        caseStudy: projects.caseStudy,
        repositoryUrl: projects.repositoryUrl,
        liveUrl: projects.liveUrl,
      })
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.status, 'published')))
      .limit(1);

    return project;
  }

  async findForAdmin() {
    return this.database.db
      .select({ slug: projects.slug, title: projects.title, summary: projects.summary, caseStudy: projects.caseStudy, repositoryUrl: projects.repositoryUrl, liveUrl: projects.liveUrl, status: projects.status, featured: projects.featured, displayOrder: projects.displayOrder })
      .from(projects)
      .orderBy(asc(projects.displayOrder));
  }

  async findForAdminBySlug(slug: string) {
    const [project] = await this.database.db
      .select({ slug: projects.slug, title: projects.title, summary: projects.summary, caseStudy: projects.caseStudy, repositoryUrl: projects.repositoryUrl, liveUrl: projects.liveUrl, status: projects.status, featured: projects.featured, displayOrder: projects.displayOrder })
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);
    return project;
  }

  async updateFeatured(slug: string, featured: boolean) {
    const [project] = await this.database.db
      .update(projects)
      .set({ featured, updatedAt: new Date() })
      .where(eq(projects.slug, slug))
      .returning({ slug: projects.slug, title: projects.title, summary: projects.summary, caseStudy: projects.caseStudy, repositoryUrl: projects.repositoryUrl, liveUrl: projects.liveUrl, status: projects.status, featured: projects.featured, displayOrder: projects.displayOrder });
    return project;
  }

  async updateContent(slug: string, content: { title: string; summary: string; caseStudy: string }) {
    const [project] = await this.database.db
      .update(projects)
      .set({ ...content, updatedAt: new Date() })
      .where(eq(projects.slug, slug))
      .returning({ slug: projects.slug, title: projects.title, summary: projects.summary, caseStudy: projects.caseStudy, repositoryUrl: projects.repositoryUrl, liveUrl: projects.liveUrl, status: projects.status, featured: projects.featured, displayOrder: projects.displayOrder });
    return project;
  }

  async updateLinks(slug: string, links: { repositoryUrl: string | null; liveUrl: string | null }) {
    const [project] = await this.database.db
      .update(projects)
      .set({ ...links, updatedAt: new Date() })
      .where(eq(projects.slug, slug))
      .returning({ slug: projects.slug, title: projects.title, summary: projects.summary, caseStudy: projects.caseStudy, repositoryUrl: projects.repositoryUrl, liveUrl: projects.liveUrl, status: projects.status, featured: projects.featured, displayOrder: projects.displayOrder });
    return project;
  }

  async updateStatus(slug: string, status: 'draft' | 'published' | 'archived') {
    const [project] = await this.database.db
      .update(projects)
      .set({ status, updatedAt: new Date() })
      .where(eq(projects.slug, slug))
      .returning({ slug: projects.slug, title: projects.title, summary: projects.summary, caseStudy: projects.caseStudy, repositoryUrl: projects.repositoryUrl, liveUrl: projects.liveUrl, status: projects.status, featured: projects.featured, displayOrder: projects.displayOrder });
    return project;
  }

  async moveProject(slug: string, direction: ProjectOrderDirection) {
    return this.database.db.transaction(async (transaction) => {
      const ordered = await transaction
        .select({ slug: projects.slug, title: projects.title, summary: projects.summary, caseStudy: projects.caseStudy, repositoryUrl: projects.repositoryUrl, liveUrl: projects.liveUrl, status: projects.status, featured: projects.featured, displayOrder: projects.displayOrder })
        .from(projects)
        .orderBy(asc(projects.displayOrder));
      const index = ordered.findIndex((project) => project.slug === slug);
      if (index === -1) return undefined;
      const neighborIndex = direction === 'up' ? index - 1 : index + 1;
      if (neighborIndex < 0 || neighborIndex >= ordered.length) return ordered;
      const project = ordered[index];
      const neighbor = ordered[neighborIndex];
      const now = new Date();
      await transaction.update(projects).set({ displayOrder: neighbor.displayOrder, updatedAt: now }).where(eq(projects.slug, project.slug));
      await transaction.update(projects).set({ displayOrder: project.displayOrder, updatedAt: now }).where(eq(projects.slug, neighbor.slug));
      return transaction
        .select({ slug: projects.slug, title: projects.title, summary: projects.summary, caseStudy: projects.caseStudy, repositoryUrl: projects.repositoryUrl, liveUrl: projects.liveUrl, status: projects.status, featured: projects.featured, displayOrder: projects.displayOrder })
        .from(projects)
        .orderBy(asc(projects.displayOrder));
    });
  }

  async createDraft(input: { slug: string; title: string; summary: string }) {
    return this.database.db.transaction(async (transaction) => {
      const [order] = await transaction
        .select({ value: sql<number>`coalesce(max(${projects.displayOrder}), -1)` })
        .from(projects);
      const [project] = await transaction
        .insert(projects)
        .values({ id: randomUUID(), ...input, status: 'draft', featured: false, displayOrder: order.value + 1 })
        .onConflictDoNothing({ target: projects.slug })
        .returning({ slug: projects.slug, title: projects.title, summary: projects.summary, caseStudy: projects.caseStudy, repositoryUrl: projects.repositoryUrl, liveUrl: projects.liveUrl, status: projects.status, featured: projects.featured, displayOrder: projects.displayOrder });
      return project;
    });
  }
}
