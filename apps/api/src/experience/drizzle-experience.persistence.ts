import { Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
import { experienceTechnologies, experiences, technologies } from '../database/schema.js';
import type {
  ExperiencePersistence,
  PublicPersistedExperience,
  PersistedExperience,
  AdminPersistedExperience,
  ExperienceContentUpdate,
  ExperiencePublicationStatus,
  CreateExperienceDraft,
  ExperienceOrderDirection,
} from './experience.persistence.js';

@Injectable()
export class DrizzleExperiencePersistence implements ExperiencePersistence {
  constructor(private readonly database: DatabaseService) {}

  async findPublished(): Promise<PublicPersistedExperience[]> {
    const rows = await this.database.db
      .select({
        id: experiences.id,
        organization: experiences.organization,
        role: experiences.role,
        summary: experiences.summary,
        location: experiences.location,
        organizationUrl: experiences.organizationUrl,
        startDate: experiences.startDate,
        endDate: experiences.endDate,
      })
      .from(experiences)
      .where(eq(experiences.status, 'published'))
      .orderBy(asc(experiences.displayOrder));
    return Promise.all(rows.map(async ({ id, ...experience }) => ({ ...experience, technologies: await this.findPublishedTechnologies(id) })));
  }

  async findFeaturedPublished(): Promise<PublicPersistedExperience[]> {
    const rows = await this.database.db.select({ organization: experiences.organization, role: experiences.role, summary: experiences.summary, location: experiences.location, organizationUrl: experiences.organizationUrl, startDate: experiences.startDate, endDate: experiences.endDate, id: experiences.id }).from(experiences).where(and(eq(experiences.status, 'published'), eq(experiences.featured, true))).orderBy(asc(experiences.displayOrder));
    return Promise.all(rows.map(async ({ id, ...experience }) => ({ ...experience, technologies: await this.findPublishedTechnologies(id) })));
  }

  async findForAdmin(): Promise<AdminPersistedExperience[]> {
    return this.database.db.select(this.adminProjection).from(experiences).orderBy(asc(experiences.displayOrder));
  }

  async findForAdminById(id: string): Promise<AdminPersistedExperience | undefined> {
    const experience = (await this.database.db.select(this.adminProjection).from(experiences).where(eq(experiences.id, id)).limit(1))[0];
    return experience && { ...experience, technologyIds: await this.findTechnologyIds(id) };
  }

  async updateContent(id: string, content: ExperienceContentUpdate): Promise<AdminPersistedExperience | undefined> {
    await this.database.db.update(experiences).set({ ...content, updatedAt: new Date() }).where(eq(experiences.id, id));
    return this.findForAdminById(id);
  }

  async updateStatus(id: string, status: ExperiencePublicationStatus): Promise<AdminPersistedExperience | undefined> {
    await this.database.db.update(experiences).set({ status, updatedAt: new Date() }).where(eq(experiences.id, id));
    return this.findForAdminById(id);
  }

  async updateFeatured(id: string, featured: boolean): Promise<AdminPersistedExperience | undefined> {
    await this.database.db.update(experiences).set({ featured, updatedAt: new Date() }).where(eq(experiences.id, id));
    return this.findForAdminById(id);
  }

  async updateLocation(id: string, location: string | null): Promise<AdminPersistedExperience | undefined> {
    await this.database.db.update(experiences).set({ location, updatedAt: new Date() }).where(eq(experiences.id, id));
    return this.findForAdminById(id);
  }

  async updateOrganizationUrl(id: string, organizationUrl: string | null): Promise<AdminPersistedExperience | undefined> {
    await this.database.db.update(experiences).set({ organizationUrl, updatedAt: new Date() }).where(eq(experiences.id, id));
    return this.findForAdminById(id);
  }

  async updateTechnologies(id: string, { technologyIds }: { technologyIds: string[] }): Promise<AdminPersistedExperience | undefined> {
    return this.database.db.transaction(async (transaction) => {
      const experience = (await transaction.select(this.adminProjection).from(experiences).where(eq(experiences.id, id)).limit(1))[0];
      if (!experience) return undefined;
      if (technologyIds.length) {
        const known = await transaction.select({ id: technologies.id }).from(technologies).where(inArray(technologies.id, technologyIds));
        if (known.length !== technologyIds.length) return undefined;
      }
      await transaction.delete(experienceTechnologies).where(eq(experienceTechnologies.experienceId, id));
      if (technologyIds.length) await transaction.insert(experienceTechnologies).values(technologyIds.map((technologyId) => ({ experienceId: id, technologyId })));
      await transaction.update(experiences).set({ updatedAt: new Date() }).where(eq(experiences.id, id));
      return { ...experience, technologyIds };
    });
  }

  async createDraft(input: CreateExperienceDraft): Promise<AdminPersistedExperience> {
    return this.database.db.transaction(async (transaction) => {
      const [order] = await transaction.select({ value: sql<number>`coalesce(max(${experiences.displayOrder}), -1)` }).from(experiences);
      const [created] = await transaction.insert(experiences).values({ id: randomUUID(), ...input, status: 'draft', displayOrder: order.value + 1 }).returning(this.adminProjection);
      return created;
    });
  }

  async moveExperience(id: string, direction: ExperienceOrderDirection): Promise<AdminPersistedExperience[] | undefined> {
    return this.database.db.transaction(async (transaction) => {
      const ordered = await transaction.select(this.adminProjection).from(experiences).orderBy(asc(experiences.displayOrder));
      const index = ordered.findIndex((experience) => experience.id === id);
      if (index === -1) return undefined;
      const neighborIndex = direction === 'up' ? index - 1 : index + 1;
      if (neighborIndex < 0 || neighborIndex >= ordered.length) return ordered;
      const experience = ordered[index]; const neighbor = ordered[neighborIndex]; const now = new Date();
      await transaction.update(experiences).set({ displayOrder: neighbor.displayOrder, updatedAt: now }).where(eq(experiences.id, experience.id));
      await transaction.update(experiences).set({ displayOrder: experience.displayOrder, updatedAt: now }).where(eq(experiences.id, neighbor.id));
      return transaction.select(this.adminProjection).from(experiences).orderBy(asc(experiences.displayOrder));
    });
  }

  private readonly adminProjection = {
    id: experiences.id,
    organization: experiences.organization,
    role: experiences.role,
    summary: experiences.summary,
    location: experiences.location,
    organizationUrl: experiences.organizationUrl,
    startDate: experiences.startDate,
    endDate: experiences.endDate,
    status: experiences.status,
    featured: experiences.featured,
    displayOrder: experiences.displayOrder,
  };

  private findTechnologyIds(id: string) {
    return this.database.db.select({ id: technologies.id }).from(experienceTechnologies).innerJoin(technologies, eq(experienceTechnologies.technologyId, technologies.id)).where(eq(experienceTechnologies.experienceId, id)).orderBy(asc(technologies.displayOrder)).then((rows) => rows.map(({ id }) => id));
  }

  private findPublishedTechnologies(id: string) {
    return this.database.db.select({ name: technologies.name, category: technologies.category }).from(experienceTechnologies).innerJoin(technologies, eq(experienceTechnologies.technologyId, technologies.id)).where(and(eq(experienceTechnologies.experienceId, id), eq(technologies.status, 'published'))).orderBy(asc(technologies.displayOrder));
  }
}
