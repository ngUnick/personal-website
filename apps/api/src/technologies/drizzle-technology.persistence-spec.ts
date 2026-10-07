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

  it('reviews and edits the seeded Draft without exposing it publicly', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleTechnologyPersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleTechnologyPersistence);
    const id = '00000000-0000-4000-8000-000000000042';
    const original = await persistence.findForAdminById(id);
    const published = await persistence.findPublished();
    try {
      expect(original).toEqual({ id, name: 'Example Draft Tool', category: 'Tools', status: 'draft', displayOrder: 2 });
      await expect(persistence.updateContent(id, { name: 'Edited Draft Tool', category: 'Edited Tools' })).resolves.toEqual({ id, name: 'Edited Draft Tool', category: 'Edited Tools', status: 'draft', displayOrder: 2 });
      await expect(persistence.findPublished()).resolves.toEqual(published);
      await expect(persistence.updateContent('00000000-0000-4000-8000-000000000099', { name: 'Missing', category: 'Missing' })).resolves.toBeUndefined();
    } finally { if (original) await persistence.updateContent(id, original); }
  });

  it('changes only status and makes visibility transitions explicit', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleTechnologyPersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleTechnologyPersistence);
    const id = '00000000-0000-4000-8000-000000000042';
    const original = await persistence.findForAdminById(id);
    try {
      await expect(persistence.updateStatus(id, 'published')).resolves.toEqual({ ...original, status: 'published' });
      await expect(persistence.findPublished()).resolves.toContainEqual({ name: original?.name, category: original?.category });
      await expect(persistence.updateStatus(id, 'archived')).resolves.toEqual({ ...original, status: 'archived' });
      await expect(persistence.findPublished()).resolves.not.toContainEqual({ name: original?.name, category: original?.category });
      await expect(persistence.updateStatus('00000000-0000-4000-8000-000000000099', 'published')).resolves.toBeUndefined();
    } finally { if (original) await persistence.updateStatus(id, original.status); }
  });

  it('creates a server-owned Draft after the current global order', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleTechnologyPersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleTechnologyPersistence);
    const database = moduleFixture.get(DatabaseService);
    let id: string | undefined;
    try {
      const created = await persistence.createDraft({ name: 'Created Technology', category: 'Testing' });
      id = created.id;
      expect(created).toEqual({ id: expect.any(String), name: 'Created Technology', category: 'Testing', status: 'draft', displayOrder: 3 });
      await expect(persistence.findPublished()).resolves.not.toContainEqual({ name: 'Created Technology', category: 'Testing' });
    } finally { if (id) await database.db.delete(technologies).where(eq(technologies.id, id)); }
  });
});
