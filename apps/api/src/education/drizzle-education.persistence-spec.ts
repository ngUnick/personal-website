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
      await database.db.delete(educations).where(eq(educations.id, insertedIds[0]));
      await database.db.delete(educations).where(eq(educations.id, insertedIds[1]));
      await database.db.delete(educations).where(eq(educations.id, insertedIds[2]));
    }
  });
});
