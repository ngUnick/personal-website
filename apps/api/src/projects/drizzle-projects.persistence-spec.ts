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
      caseStudy: 'Fictional narrative used to validate the published project detail path.\n\nIt is deliberately not personal portfolio content.',
      repositoryUrl: null,
      liveUrl: null,
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
      id: '00000000-0000-4000-8000-000000000006',
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
      id: '00000000-0000-4000-8000-000000000005',
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

  it('updates only project links while list queries stay compact', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleProjectsPersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleProjectsPersistence);

    await expect(persistence.updateLinks('placeholder-project', {
      repositoryUrl: 'https://github.com/example/project',
      liveUrl: 'https://example.test/project',
    })).resolves.toMatchObject({
      slug: 'placeholder-project',
      repositoryUrl: 'https://github.com/example/project',
      liveUrl: 'https://example.test/project',
    });
    await expect(persistence.findPublished()).resolves.toEqual([{
      slug: 'placeholder-project',
      title: 'Placeholder Project',
      summary: 'Temporary sample content used to validate the application path.',
    }]);
    await expect(persistence.updateLinks('placeholder-project', {
      repositoryUrl: null,
      liveUrl: null,
    })).resolves.toMatchObject({ repositoryUrl: null, liveUrl: null });
  });

  it('creates an unfeatured draft after existing projects and handles duplicate slugs', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleProjectsPersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleProjectsPersistence);
    const database = moduleFixture.get(DatabaseService);
    const input = { slug: 'persistence-created-draft', title: 'Persistence Created Draft', summary: 'Fake content used only for creation verification.' };
    try {
      const created = await persistence.createDraft(input);
      expect(created).toMatchObject({ ...input, caseStudy: '', status: 'draft', featured: false });
      expect(created?.displayOrder).toBeGreaterThan(1);
      await expect(persistence.createDraft(input)).resolves.toBeUndefined();
      await expect(persistence.findPublishedBySlug(input.slug)).resolves.toBeUndefined();
    } finally {
      await database.db.delete(projects).where(eq(projects.slug, input.slug));
    }
  });

  it('moves adjacent projects without changing their content or state', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleProjectsPersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleProjectsPersistence); const database = moduleFixture.get(DatabaseService);
    const first = { id: '00000000-0000-4000-8000-000000000007', slug: 'order-first', title: 'Order First', summary: 'Fake order fixture.', status: 'draft' as const, featured: false, displayOrder: 20 };
    const second = { ...first, id: '00000000-0000-4000-8000-000000000008', slug: 'order-second', title: 'Order Second', displayOrder: 21 };
    await database.db.insert(projects).values([first, second]);
    try {
      expect(await persistence.moveProject('missing-order-project', 'up')).toBeUndefined();
      const moved = await persistence.moveProject(second.slug, 'up');
      expect(moved?.filter((project) => project.slug.startsWith('order-')).map((project) => project.slug)).toEqual([second.slug, first.slug]);
      expect(moved?.find((project) => project.slug === second.slug)).toMatchObject({ title: second.title, status: second.status, featured: second.featured, summary: second.summary });
      await persistence.moveProject(second.slug, 'down');
      expect((await persistence.findForAdmin()).filter((project) => project.slug.startsWith('order-')).map((project) => project.slug)).toEqual([first.slug, second.slug]);
    } finally { await database.db.delete(projects).where(eq(projects.slug, first.slug)); await database.db.delete(projects).where(eq(projects.slug, second.slug)); }
  });
});
