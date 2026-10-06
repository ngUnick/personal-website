import { Test, TestingModule } from '@nestjs/testing';
import { eq } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseModule } from '../database/database.module.js';
import { DatabaseService } from '../database/database.service.js';
import { technologies } from '../database/schema.js';
import { DrizzleTechnologyPersistence } from './drizzle-technology.persistence.js';

describe('DrizzleTechnologyPersistence', () => {
  let moduleFixture: TestingModule;
  afterEach(async () => moduleFixture?.close());
  it('returns only published technologies in global display order and public shape', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleTechnologyPersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleTechnologyPersistence);
    const database = moduleFixture.get(DatabaseService);
    const extraIds = ['00000000-0000-4000-8000-000000000043', '00000000-0000-4000-8000-000000000044'];
    await database.db.insert(technologies).values([{ id: extraIds[0], name: 'Example Ordered Framework', category: 'Frameworks', status: 'published', displayOrder: 3 }, { id: extraIds[1], name: 'Example Archived Tool', category: 'Tools', status: 'archived', displayOrder: 4 }]);
    try { await expect(persistence.findPublished()).resolves.toEqual([{ name: 'Example TypeScript', category: 'Languages' }, { name: 'Example PostgreSQL', category: 'Data' }, { name: 'Example Ordered Framework', category: 'Frameworks' }]); }
    finally { for (const id of extraIds) await database.db.delete(technologies).where(eq(technologies.id, id)); }
  });
});
