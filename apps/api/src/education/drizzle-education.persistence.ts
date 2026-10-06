import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { educations } from '../database/schema.js';
import {
  type EducationPersistence,
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
}
