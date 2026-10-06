import { Injectable } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
import { educations } from '../database/schema.js';
import {
  type EducationPersistence,
  type AdminPersistedEducation,
  type EducationContentUpdate,
  type CreateEducationDraft,
  type EducationOrderDirection,
  type EducationPublicationStatus,
  type PublicEducation,
} from './education.persistence.js';
@Injectable()
export class DrizzleEducationPersistence implements EducationPersistence {
  constructor(private readonly database: DatabaseService) {}

  async findPublished(): Promise<PublicEducation[]> {
    return this.database.db
      .select({
        institution: educations.institution,
        qualification: educations.qualification,
        summary: educations.summary,
        startDate: educations.startDate,
        endDate: educations.endDate,
      })
      .from(educations)
      .where(eq(educations.status, 'published'))
      .orderBy(asc(educations.displayOrder));
  }

  async findForAdmin(): Promise<AdminPersistedEducation[]> {
    return this.database.db
      .select({
        id: educations.id,
        institution: educations.institution,
        qualification: educations.qualification,
        summary: educations.summary,
        startDate: educations.startDate,
        endDate: educations.endDate,
        status: educations.status,
        displayOrder: educations.displayOrder,
      })
      .from(educations)
      .orderBy(asc(educations.displayOrder));
  }

  async findForAdminById(
    id: string,
  ): Promise<AdminPersistedEducation | undefined> {
    const [education] = await this.database.db
      .select({
        id: educations.id,
        institution: educations.institution,
        qualification: educations.qualification,
        summary: educations.summary,
        startDate: educations.startDate,
        endDate: educations.endDate,
        status: educations.status,
        displayOrder: educations.displayOrder,
      })
      .from(educations)
      .where(eq(educations.id, id))
      .limit(1);
    return education;
  }

  async updateContent(
    id: string,
    content: EducationContentUpdate,
  ): Promise<AdminPersistedEducation | undefined> {
    const [education] = await this.database.db
      .update(educations)
      .set({ ...content, updatedAt: new Date() })
      .where(eq(educations.id, id))
      .returning({
        id: educations.id,
        institution: educations.institution,
        qualification: educations.qualification,
        summary: educations.summary,
        startDate: educations.startDate,
        endDate: educations.endDate,
        status: educations.status,
        displayOrder: educations.displayOrder,
      });
    return education;
  }

  async updateStatus(
    id: string,
    status: EducationPublicationStatus,
  ): Promise<AdminPersistedEducation | undefined> {
    await this.database.db
      .update(educations)
      .set({ status, updatedAt: new Date() })
      .where(eq(educations.id, id));
    return this.findForAdminById(id);
  }

  async createDraft(
    input: CreateEducationDraft,
  ): Promise<AdminPersistedEducation> {
    return this.database.db.transaction(async (transaction) => {
      const [order] = await transaction
        .select({ value: sql<number>`coalesce(max(${educations.displayOrder}), -1)` })
        .from(educations);
      const [created] = await transaction
        .insert(educations)
        .values({
          id: randomUUID(),
          ...input,
          status: 'draft',
          displayOrder: order.value + 1,
        })
        .returning({
          id: educations.id,
          institution: educations.institution,
          qualification: educations.qualification,
          summary: educations.summary,
          startDate: educations.startDate,
          endDate: educations.endDate,
          status: educations.status,
          displayOrder: educations.displayOrder,
        });
      return created;
    });
  }

  async moveEducation(
    id: string,
    direction: EducationOrderDirection,
  ): Promise<AdminPersistedEducation[] | undefined> {
    return this.database.db.transaction(async (transaction) => {
      const ordered = await transaction
        .select(this.adminProjection)
        .from(educations)
        .orderBy(asc(educations.displayOrder));
      const index = ordered.findIndex((education) => education.id === id);
      if (index === -1) return undefined;
      const neighborIndex = direction === 'up' ? index - 1 : index + 1;
      if (neighborIndex < 0 || neighborIndex >= ordered.length) return ordered;
      const education = ordered[index];
      const neighbor = ordered[neighborIndex];
      const now = new Date();
      await transaction
        .update(educations)
        .set({ displayOrder: neighbor.displayOrder, updatedAt: now })
        .where(eq(educations.id, education.id));
      await transaction
        .update(educations)
        .set({ displayOrder: education.displayOrder, updatedAt: now })
        .where(eq(educations.id, neighbor.id));
      return transaction
        .select(this.adminProjection)
        .from(educations)
        .orderBy(asc(educations.displayOrder));
    });
  }

  private readonly adminProjection = {
    id: educations.id,
    institution: educations.institution,
    qualification: educations.qualification,
    summary: educations.summary,
    startDate: educations.startDate,
    endDate: educations.endDate,
    status: educations.status,
    displayOrder: educations.displayOrder,
  };
}
