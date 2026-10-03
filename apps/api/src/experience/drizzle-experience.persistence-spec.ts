import { Test, TestingModule } from '@nestjs/testing';
import { eq } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseModule } from '../database/database.module.js';
import { DatabaseService } from '../database/database.service.js';
import { experiences } from '../database/schema.js';
import { DrizzleExperiencePersistence } from './drizzle-experience.persistence.js';

describe('DrizzleExperiencePersistence', () => {
  let moduleFixture: TestingModule;

  afterEach(async () => moduleFixture?.close());

  it('returns only published experience in display order', async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [DrizzleExperiencePersistence],
    }).compile();
    const persistence = moduleFixture.get(DrizzleExperiencePersistence);
    const database = moduleFixture.get(DatabaseService);

    await database.db.insert(experiences).values([
      {
        id: '00000000-0000-4000-8000-000000000013',
        organization: 'Second Example Studio',
        role: 'Second Example Role',
        summary: 'Fake published content used for ordering verification.',
        startDate: '2025-01-01',
        endDate: null,
        status: 'published',
        displayOrder: 1,
      },
      {
        id: '00000000-0000-4000-8000-000000000011',
        organization: 'Draft Studio',
        role: 'Draft Role',
        summary: 'Fake draft.',
        startDate: '2023-01-01',
        endDate: null,
        status: 'draft',
        displayOrder: 2,
      },
      {
        id: '00000000-0000-4000-8000-000000000012',
        organization: 'Archived Studio',
        role: 'Archived Role',
        summary: 'Fake archive.',
        startDate: '2022-01-01',
        endDate: '2022-12-31',
        status: 'archived',
        displayOrder: 3,
      },
    ]);

    try {
      await expect(persistence.findPublished()).resolves.toEqual([
        {
          organization: 'Example Software Studio',
          role: 'Example Software Engineer',
          summary:
            'Fictional development fixture used to validate the public experience path.',
          startDate: '2024-01-01',
          endDate: null,
        },
        {
          organization: 'Second Example Studio',
          role: 'Second Example Role',
          summary: 'Fake published content used for ordering verification.',
          startDate: '2025-01-01',
          endDate: null,
        },
      ]);
    } finally {
      await database.db
        .delete(experiences)
        .where(eq(experiences.organization, 'Draft Studio'));
      await database.db
        .delete(experiences)
        .where(eq(experiences.organization, 'Archived Studio'));
      await database.db
        .delete(experiences)
        .where(eq(experiences.organization, 'Second Example Studio'));
    }
  });
});
