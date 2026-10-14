import { Test, TestingModule } from '@nestjs/testing';
import { asc, eq } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseModule } from '../database/database.module.js';
import { DatabaseService } from '../database/database.service.js';
import { projectTechnologies, projects, technologies } from '../database/schema.js';
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
        startedOn: null,
        completedOn: null,
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
      startedOn: null,
      completedOn: null,
      role: null,
      caseStudy: 'Fictional narrative used to validate the published project detail path.\n\nIt is deliberately not personal portfolio content.',
      repositoryUrl: null,
      liveUrl: null,
      technologies: [],
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
          startedOn: null,
          completedOn: null,
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
      startedOn: null,
      completedOn: null,
    }]);
    await expect(persistence.updateLinks('placeholder-project', {
      repositoryUrl: null,
      liveUrl: null,
    })).resolves.toMatchObject({ repositoryUrl: null, liveUrl: null });
  });

  it('updates a project role without widening compact lists or changing other detail fields', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleProjectsPersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleProjectsPersistence);

    try {
      await expect(persistence.updateRole('placeholder-project', 'Software Engineer')).resolves.toMatchObject({
        slug: 'placeholder-project',
        role: 'Software Engineer',
        title: 'Placeholder Project',
        summary: 'Temporary sample content used to validate the application path.',
        caseStudy: 'Fictional narrative used to validate the published project detail path.\n\nIt is deliberately not personal portfolio content.',
      });
      await expect(persistence.findPublished()).resolves.toEqual([{
        slug: 'placeholder-project',
        title: 'Placeholder Project',
        summary: 'Temporary sample content used to validate the application path.',
        startedOn: null,
        completedOn: null,
      }]);
      await expect(persistence.findFeaturedPublished()).resolves.toEqual([{
        slug: 'placeholder-project',
        title: 'Placeholder Project',
        summary: 'Temporary sample content used to validate the application path.',
        startedOn: null,
        completedOn: null,
      }]);
      await expect(persistence.findPublishedBySlug('placeholder-project')).resolves.toMatchObject({ role: 'Software Engineer' });
      await expect(persistence.updateRole('missing-project', null)).resolves.toBeUndefined();
    } finally {
      await persistence.updateRole('placeholder-project', null);
    }
  });

  it('updates only Project timeline dates and preserves chronology at the database boundary', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleProjectsPersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleProjectsPersistence);
    const database = moduleFixture.get(DatabaseService);

    try {
      await expect(persistence.updateCompletionDate('placeholder-project', '2025-01-01')).resolves.toMatchObject({
        slug: 'placeholder-project',
        startedOn: null,
        completedOn: '2025-01-01',
        title: 'Placeholder Project',
        status: 'published',
        featured: true,
        displayOrder: 0,
      });
      await expect(persistence.findPublished()).resolves.toEqual([{
        slug: 'placeholder-project',
        title: 'Placeholder Project',
        summary: 'Temporary sample content used to validate the application path.',
        startedOn: null,
        completedOn: '2025-01-01',
      }]);
      await expect(persistence.updateStartDate('placeholder-project', '2024-01-01')).resolves.toMatchObject({
        slug: 'placeholder-project',
        startedOn: '2024-01-01',
        completedOn: '2025-01-01',
        title: 'Placeholder Project',
        status: 'published',
        featured: true,
        displayOrder: 0,
      });
      await expect(persistence.findPublished()).resolves.toEqual([{
        slug: 'placeholder-project',
        title: 'Placeholder Project',
        summary: 'Temporary sample content used to validate the application path.',
        startedOn: '2024-01-01',
        completedOn: '2025-01-01',
      }]);
      await expect(
        database.db
          .update(projects)
          .set({ startedOn: '2026-01-01' })
          .where(eq(projects.slug, 'placeholder-project')),
      ).rejects.toThrow();
      await expect(persistence.updateStartDate('missing-project', null)).resolves.toBeUndefined();
      await expect(persistence.updateCompletionDate('missing-project', null)).resolves.toBeUndefined();
    } finally {
      await persistence.updateStartDate('placeholder-project', null);
      await persistence.updateCompletionDate('placeholder-project', null);
    }
  });

  it('replaces private technology associations while public detail filters drafts in global order', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleProjectsPersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleProjectsPersistence);
    const database = moduleFixture.get(DatabaseService);
    const slug = 'technology-association-persistence-project';
    const ids = ['00000000-0000-4000-8000-000000000041', '00000000-0000-4000-8000-000000000040', '00000000-0000-4000-8000-000000000042'];
    await database.db.insert(projects).values({
      id: '00000000-0000-4000-8000-000000000050',
      slug,
      title: 'Technology Association Persistence Project',
      summary: 'Fake content used only for project technology persistence verification.',
      caseStudy: 'Fake narrative used only for project technology persistence verification.',
      status: 'published',
      featured: false,
      displayOrder: 50,
    });
    try {
      await expect(persistence.updateTechnologies(slug, { technologyIds: ids })).resolves.toMatchObject({ technologyIds: ids });
      const afterContent = await persistence.updateContent(slug, {
        title: 'Technology Association Persistence Project',
        summary: 'Fake content used only for project technology persistence verification.',
        caseStudy: 'Fake narrative used only for project technology persistence verification.',
      });
      expect(afterContent?.technologyIds).toEqual(expect.arrayContaining(ids));
      expect(afterContent?.technologyIds).toHaveLength(ids.length);
      const afterStatus = await persistence.updateStatus(slug, 'published');
      expect(afterStatus?.technologyIds).toEqual(expect.arrayContaining(ids));
      expect(afterStatus?.technologyIds).toHaveLength(ids.length);
      await expect(persistence.findPublishedBySlug(slug)).resolves.toMatchObject({ technologies: expect.arrayContaining([
        { name: 'Example PostgreSQL', category: 'Data' },
        { name: 'Example TypeScript', category: 'Languages' },
      ]) });
      await expect(persistence.updateTechnologies(slug, { technologyIds: ['00000000-0000-4000-8000-000000000099'] })).resolves.toBeUndefined();
    } finally {
      await database.db.delete(projects).where(eq(projects.slug, slug));
    }
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

  it('deletes only Drafts, cascades their technologies, and leaves other Projects untouched', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleProjectsPersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleProjectsPersistence); const database = moduleFixture.get(DatabaseService);
    const draft = { id: '00000000-0000-4000-8000-000000000061', slug: 'deletable-draft', title: 'Deletable Draft', summary: 'Fake deletion fixture.', status: 'draft' as const, featured: false, displayOrder: 61 };
    const published = { ...draft, id: '00000000-0000-4000-8000-000000000062', slug: 'undeletable-published', status: 'published' as const, displayOrder: 62 };
    const archived = { ...draft, id: '00000000-0000-4000-8000-000000000063', slug: 'undeletable-archived', status: 'archived' as const, displayOrder: 63 };
    await database.db.insert(projects).values([draft, published, archived]);
    await database.db.insert(projectTechnologies).values({ projectId: draft.id, technologyId: '00000000-0000-4000-8000-000000000040' });
    try {
      await expect(persistence.deleteDraft('missing-draft')).resolves.toBe(false);
      await expect(persistence.deleteDraft(published.slug)).resolves.toBe(false);
      await expect(persistence.deleteDraft(archived.slug)).resolves.toBe(false);
      await expect(persistence.deleteDraft(draft.slug)).resolves.toBe(true);
      expect(await persistence.findForAdminBySlug(draft.slug)).toBeUndefined();
      expect(await database.db.select().from(projectTechnologies).where(eq(projectTechnologies.projectId, draft.id))).toEqual([]);
      expect(await persistence.findForAdminBySlug(published.slug)).toMatchObject({ status: 'published', displayOrder: 62 });
      expect(await persistence.findForAdminBySlug(archived.slug)).toMatchObject({ status: 'archived', displayOrder: 63 });
    } finally { await database.db.delete(projects).where(eq(projects.slug, published.slug)); await database.db.delete(projects).where(eq(projects.slug, archived.slug)); }
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
