import { Test, TestingModule } from '@nestjs/testing';
import { eq } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseModule } from '../database/database.module.js';
import { DatabaseService } from '../database/database.service.js';
import { educations } from '../database/schema.js';
import { DrizzleEducationPersistence } from './drizzle-education.persistence.js';

describe('DrizzleEducationPersistence', () => {
  let moduleFixture: TestingModule;

  afterEach(async () => moduleFixture?.close());

  it('returns only published education in display order and public shape', async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [DrizzleEducationPersistence],
    }).compile();
    const persistence = moduleFixture.get(DrizzleEducationPersistence);
    const database = moduleFixture.get(DatabaseService);
    const insertedIds = [
      '00000000-0000-4000-8000-000000000031',
      '00000000-0000-4000-8000-000000000032',
      '00000000-0000-4000-8000-000000000033',
    ];

    await database.db.insert(educations).values([
      {
        id: insertedIds[0],
        institution: 'Second Example Institute',
        qualification: 'Second Qualification',
        summary: 'Fictional ordered fixture.',
        startDate: '2024-01-01',
        endDate: null,
        status: 'published',
        displayOrder: 1,
      },
      {
        id: insertedIds[1],
        institution: 'Draft Institute',
        qualification: 'Draft Qualification',
        summary: 'Private fixture.',
        startDate: '2024-01-01',
        endDate: null,
        status: 'draft',
        displayOrder: 2,
      },
      {
        id: insertedIds[2],
        institution: 'Archived Institute',
        qualification: 'Archived Qualification',
        summary: 'Private fixture.',
        startDate: '2024-01-01',
        endDate: null,
        status: 'archived',
        displayOrder: 3,
      },
    ]);

    try {
      await expect(persistence.findPublished()).resolves.toEqual([
        {
          institution: 'Example Technical Institute',
          qualification: 'Example Software Engineering Diploma',
          summary:
            'Fictional education fixture used to validate the public homepage path.',
          startDate: '2020-01-01',
          endDate: '2023-01-01',
        },
        {
          institution: 'Second Example Institute',
          qualification: 'Second Qualification',
          summary: 'Fictional ordered fixture.',
          startDate: '2024-01-01',
          endDate: null,
        },
      ]);
    } finally {
      await database.db
        .delete(educations)
        .where(eq(educations.id, insertedIds[0]));
      await database.db
        .delete(educations)
        .where(eq(educations.id, insertedIds[1]));
      await database.db
        .delete(educations)
        .where(eq(educations.id, insertedIds[2]));
    }
  });

  it('reads, edits, and changes publication for the seeded Draft without changing display order', async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [DrizzleEducationPersistence],
    }).compile();
    const persistence = moduleFixture.get(DrizzleEducationPersistence);
    const id = '00000000-0000-4000-8000-000000000034';
    const database = moduleFixture.get(DatabaseService);
    const original = await persistence.findForAdminById(id);
    const publishedBeforeEdit = await persistence.findPublished();

    try {
      expect(original).toEqual({
        id,
        institution: 'Example Draft Institute',
        qualification: 'Example Draft Software Program',
        summary:
          'Fictional draft education used only to validate private CMS authoring.',
        startDate: '2024-01-01',
        endDate: null,
        status: 'draft',
        displayOrder: 1,
      });
      await expect(persistence.findForAdmin()).resolves.toEqual([
        {
          id: '00000000-0000-4000-8000-000000000030',
          institution: 'Example Technical Institute',
          qualification: 'Example Software Engineering Diploma',
          summary:
            'Fictional education fixture used to validate the public homepage path.',
          startDate: '2020-01-01',
          endDate: '2023-01-01',
          status: 'published',
          displayOrder: 0,
        },
        original,
      ]);
      await expect(
        persistence.updateContent(id, {
          institution: 'Edited Institute',
          qualification: 'Edited Qualification',
          summary: 'Edited fixture.',
          startDate: '2025-02-01',
          endDate: '2025-12-31',
        }),
      ).resolves.toEqual({
        id,
        institution: 'Edited Institute',
        qualification: 'Edited Qualification',
        summary: 'Edited fixture.',
        startDate: '2025-02-01',
        endDate: '2025-12-31',
        status: 'draft',
        displayOrder: 1,
      });
      await expect(persistence.findPublished()).resolves.toEqual(
        publishedBeforeEdit,
      );
      await expect(persistence.updateStatus(id, 'published')).resolves.toEqual({
        id,
        institution: 'Edited Institute',
        qualification: 'Edited Qualification',
        summary: 'Edited fixture.',
        startDate: '2025-02-01',
        endDate: '2025-12-31',
        status: 'published',
        displayOrder: 1,
      });
      await expect(persistence.findPublished()).resolves.toEqual([
        ...publishedBeforeEdit,
        {
          institution: 'Edited Institute',
          qualification: 'Edited Qualification',
          summary: 'Edited fixture.',
          startDate: '2025-02-01',
          endDate: '2025-12-31',
        },
      ]);
      await expect(
        persistence.updateStatus(id, 'archived'),
      ).resolves.toMatchObject({
        id,
        status: 'archived',
        displayOrder: 1,
      });
      await expect(persistence.findPublished()).resolves.toEqual(
        publishedBeforeEdit,
      );
      await expect(
        persistence.updateContent('00000000-0000-4000-8000-000000000099', {
          institution: 'Missing',
          qualification: 'Missing',
          summary: 'Missing.',
          startDate: '2025-01-01',
          endDate: null,
        }),
      ).resolves.toBeUndefined();
    } finally {
      if (original) {
        await persistence.updateContent(id, original);
        await persistence.updateStatus(id, original.status);
      }
    }
  });

  it('creates a Draft after the global maximum order without changing public records', async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [DrizzleEducationPersistence],
    }).compile();
    const persistence = moduleFixture.get(DrizzleEducationPersistence);
    const database = moduleFixture.get(DatabaseService);
    const publicBefore = await persistence.findPublished();
    const orderedBefore = await persistence.findForAdmin();
    let createdId: string | undefined;

    try {
      const created = await persistence.createDraft({
        institution: 'Created Institute',
        qualification: 'Created Qualification',
        summary: 'Fictional creation fixture.',
        startDate: '2026-01-01',
        endDate: null,
      });
      createdId = created.id;
      expect(created).toEqual({
        id: expect.any(String),
        institution: 'Created Institute',
        qualification: 'Created Qualification',
        summary: 'Fictional creation fixture.',
        startDate: '2026-01-01',
        endDate: null,
        status: 'draft',
        displayOrder: orderedBefore.at(-1)!.displayOrder + 1,
      });
      expect(created.id).not.toBe('00000000-0000-4000-8000-000000000034');
      await expect(persistence.findPublished()).resolves.toEqual(publicBefore);
      await expect(persistence.findForAdmin()).resolves.toEqual([
        ...orderedBefore,
        created,
      ]);
    } finally {
      if (createdId)
        await database.db.delete(educations).where(eq(educations.id, createdId));
    }
  });
});
