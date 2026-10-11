import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { projectTechnologies, projects, technologies } from '../database/schema.js';
import {
  PersistedProject,
  PersistedProjectDetail,
  PublicPersistedProjectDetail,
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
  ): Promise<PublicPersistedProjectDetail | undefined> {
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

    if (!project) return undefined;
    return { ...project, technologies: await this.findPublishedTechnologies(slug) };
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
    if (!project) return undefined;
    return { ...project, technologyIds: await this.findTechnologyIds(slug) };
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
    if (!project) return undefined;
    return { ...project, technologyIds: await this.findTechnologyIds(slug) };
  }

  async updateLinks(slug: string, links: { repositoryUrl: string | null; liveUrl: string | null }) {
    const [project] = await this.database.db
      .update(projects)
      .set({ ...links, updatedAt: new Date() })
      .where(eq(projects.slug, slug))
      .returning({ slug: projects.slug, title: projects.title, summary: projects.summary, caseStudy: projects.caseStudy, repositoryUrl: projects.repositoryUrl, liveUrl: projects.liveUrl, status: projects.status, featured: projects.featured, displayOrder: projects.displayOrder });
    if (!project) return undefined;
    return { ...project, technologyIds: await this.findTechnologyIds(slug) };
  }

  async updateTechnologies(slug: string, { technologyIds }: { technologyIds: string[] }) {
    return this.database.db.transaction(async (transaction) => {
      const [project] = await transaction.select({ id: projects.id }).from(projects).where(eq(projects.slug, slug)).limit(1);
      if (!project) return undefined;
      if (technologyIds.length) {
        const known = await transaction.select({ id: technologies.id }).from(technologies).where(inArray(technologies.id, technologyIds));
        if (known.length !== technologyIds.length) return undefined;
      }
      await transaction.delete(projectTechnologies).where(eq(projectTechnologies.projectId, project.id));
      if (technologyIds.length) await transaction.insert(projectTechnologies).values(technologyIds.map(technologyId => ({ projectId: project.id, technologyId })));
      const [updated] = await transaction.select({ slug: projects.slug, title: projects.title, summary: projects.summary, caseStudy: projects.caseStudy, repositoryUrl: projects.repositoryUrl, liveUrl: projects.liveUrl, status: projects.status, featured: projects.featured, displayOrder: projects.displayOrder }).from(projects).where(eq(projects.id, project.id));
      return { ...updated!, technologyIds };
    });
  }

  async updateStatus(slug: string, status: 'draft' | 'published' | 'archived') {
    const [project] = await this.database.db
      .update(projects)
      .set({ status, updatedAt: new Date() })
      .where(eq(projects.slug, slug))
      .returning({ slug: projects.slug, title: projects.title, summary: projects.summary, caseStudy: projects.caseStudy, repositoryUrl: projects.repositoryUrl, liveUrl: projects.liveUrl, status: projects.status, featured: projects.featured, displayOrder: projects.displayOrder });
    if (!project) return undefined;
    return { ...project, technologyIds: await this.findTechnologyIds(slug) };
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

  private async findTechnologyIds(slug: string): Promise<string[]> {
    const rows = await this.database.db.select({ id: technologies.id }).from(projectTechnologies).innerJoin(projects, eq(projectTechnologies.projectId, projects.id)).innerJoin(technologies, eq(projectTechnologies.technologyId, technologies.id)).where(eq(projects.slug, slug)).orderBy(asc(technologies.displayOrder));
    return rows.map(row => row.id);
  }

  private async findPublishedTechnologies(slug: string) {
    return this.database.db.select({ name: technologies.name, category: technologies.category }).from(projectTechnologies).innerJoin(projects, eq(projectTechnologies.projectId, projects.id)).innerJoin(technologies, eq(projectTechnologies.technologyId, technologies.id)).where(and(eq(projects.slug, slug), eq(technologies.status, 'published'))).orderBy(asc(technologies.displayOrder));
  }
}
