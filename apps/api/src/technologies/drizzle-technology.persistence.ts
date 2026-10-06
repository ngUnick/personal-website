import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { technologies } from '../database/schema.js';
import { PublicTechnology, TechnologyPersistence } from './technology.persistence.js';
@Injectable()
export class DrizzleTechnologyPersistence implements TechnologyPersistence {
  constructor(private readonly database: DatabaseService) {}
  findPublished(): Promise<PublicTechnology[]> {
    return this.database.db.select({ name: technologies.name, category: technologies.category }).from(technologies).where(eq(technologies.status, 'published')).orderBy(asc(technologies.displayOrder));
  }
}
