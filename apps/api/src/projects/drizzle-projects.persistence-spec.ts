import { Test, TestingModule } from '@nestjs/testing';
import { eq } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseModule } from '../database/database.module.js';
import { DatabaseService } from '../database/database.service.js';
import { projects } from '../database/schema.js';
import { DrizzleProjectsPersistence } from './drizzle-projects.persistence.js';

describe('DrizzleProjectsPersistence', () => {
  let moduleFixture: TestingModule;

  afterEach(async () => moduleFixture?.close());

  it('reads the deterministic published placeholder from PostgreSQL', async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [DrizzleProjectsPersistence],
    }).compile();

    const persistence = moduleFixture.get(DrizzleProjectsPersistence);

    await expect(persistence.findPublished()).resolves.toEqual([
      {
        slug: 'placeholder-project',
        title: 'Placeholder Project',
        summary:
          'Temporary sample content used to validate the application path.',
      },
    ]);
  });

  it('finds a published project by slug', async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [DrizzleProjectsPersistence],
    }).compile();

    const persistence = moduleFixture.get(DrizzleProjectsPersistence);

    await expect(
      persistence.findPublishedBySlug('placeholder-project'),
    ).resolves.toEqual({
      slug: 'placeholder-project',
      title: 'Placeholder Project',
      summary:
        'Temporary sample content used to validate the application path.',
    });
  });

  it('reads only featured published projects', async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [DrizzleProjectsPersistence],
    }).compile();

    const persistence = moduleFixture.get(DrizzleProjectsPersistence);
    const database = moduleFixture.get(DatabaseService);

    await database.db.insert(projects).values({
      id: '00000000-0000-4000-8000-000000000003',
      slug: 'featured-draft-project',
      title: 'Featured Draft Project',
      summary: 'Fake draft content used only for persistence verification.',
      status: 'draft',
      featured: true,
      displayOrder: 1,
    });
    await database.db.insert(projects).values({
      id: '00000000-0000-4000-8000-000000000004',
      slug: 'non-featured-published-project',
      title: 'Non-featured Published Project',
      summary: 'Fake published content used only for persistence verification.',
      status: 'published',
      featured: false,
      displayOrder: 2,
    });

    try {
      await expect(persistence.findFeaturedPublished()).resolves.toEqual([
        {
          slug: 'placeholder-project',
          title: 'Placeholder Project',
          summary:
            'Temporary sample content used to validate the application path.',
        },
      ]);
    } finally {
      await database.db
        .delete(projects)
        .where(eq(projects.slug, 'featured-draft-project'));
      await database.db
        .delete(projects)
        .where(eq(projects.slug, 'non-featured-published-project'));
    }
  });

  it('does not expose a draft project by slug', async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [DrizzleProjectsPersistence],
    }).compile();

    const persistence = moduleFixture.get(DrizzleProjectsPersistence);
    const database = moduleFixture.get(DatabaseService);

    await database.db.insert(projects).values({
      id: '00000000-0000-4000-8000-000000000002',
      slug: 'draft-project',
      title: 'Draft Project',
      summary: 'Fake draft content used only for persistence verification.',
      status: 'draft',
      featured: false,
      displayOrder: 1,
    });

    try {
      await expect(
        persistence.findPublishedBySlug('draft-project'),
      ).resolves.toBeUndefined();
    } finally {
      await database.db
        .delete(projects)
        .where(eq(projects.slug, 'draft-project'));
    }
  });
});
