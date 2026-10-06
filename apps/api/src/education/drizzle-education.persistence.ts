import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { educations } from '../database/schema.js';
import {
  type EducationPersistence,
  type AdminPersistedEducation,
  type EducationContentUpdate,
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
}
