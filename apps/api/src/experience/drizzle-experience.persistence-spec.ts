import { Test, TestingModule } from '@nestjs/testing';
import { eq } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseModule } from '../database/database.module.js';
import { DatabaseService } from '../database/database.service.js';
import { experienceTechnologies, experiences } from '../database/schema.js';
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
        location: null,
        organizationUrl: null,
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
        location: null,
        organizationUrl: null,
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
        location: null,
        organizationUrl: null,
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
          location: null,
          organizationUrl: null,
          startDate: '2024-01-01',
          endDate: null,
          technologies: [],
        },
        {
          organization: 'Second Example Studio',
          role: 'Second Example Role',
          summary: 'Fake published content used for ordering verification.',
          location: null,
          organizationUrl: null,
          startDate: '2025-01-01',
          endDate: null,
          technologies: [],
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

  it('returns only featured published experience and changes no other fields when featured changes', async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [DrizzleExperiencePersistence],
    }).compile();
    const persistence = moduleFixture.get(DrizzleExperiencePersistence);
    const publishedId = '00000000-0000-4000-8000-000000000010';
    const draftId = '00000000-0000-4000-8000-000000000014';
    const originalPublished = await persistence.findForAdminById(publishedId);
    const originalDraft = await persistence.findForAdminById(draftId);

    try {
      await expect(persistence.findFeaturedPublished()).resolves.toEqual([
        {
          organization: 'Example Software Studio',
          role: 'Example Software Engineer',
          summary:
            'Fictional development fixture used to validate the public experience path.',
          location: null,
          organizationUrl: null,
          startDate: '2024-01-01',
          endDate: null,
          technologies: [],
        },
      ]);
      await expect(persistence.updateFeatured(draftId, true)).resolves.toEqual({
        ...originalDraft,
        featured: true,
      });
      await expect(persistence.findFeaturedPublished()).resolves.toEqual([
        {
          organization: 'Example Software Studio',
          role: 'Example Software Engineer',
          summary:
            'Fictional development fixture used to validate the public experience path.',
          location: null,
          organizationUrl: null,
          startDate: '2024-01-01',
          endDate: null,
          technologies: [],
        },
      ]);
      await expect(persistence.updateFeatured(publishedId, false)).resolves.toEqual({
        ...originalPublished,
        featured: false,
      });
      await expect(persistence.findFeaturedPublished()).resolves.toEqual([]);
      await expect(persistence.updateFeatured('00000000-0000-4000-8000-000000000099', true)).resolves.toBeUndefined();
    } finally {
      await persistence.updateFeatured(publishedId, originalPublished!.featured);
      await persistence.updateFeatured(draftId, originalDraft!.featured);
    }
  });

  it('supports private draft authoring without changing publication or order', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleExperiencePersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleExperiencePersistence);
    const draftId = '00000000-0000-4000-8000-000000000014';
    const original = { organization: 'Example Draft Studio', role: 'Example Draft Engineer', summary: 'Fictional draft experience used only to validate private CMS authoring.', location: null, organizationUrl: null, startDate: '2025-01-01', endDate: null };
    const before = await persistence.findForAdmin();
    expect(before.map((experience) => experience.id).slice(0, 2)).toEqual([
      '00000000-0000-4000-8000-000000000010',
      draftId,
    ]);
    await expect(persistence.findForAdminById(draftId)).resolves.toEqual({
      id: draftId,
        ...original,
        featured: false,
      status: 'draft',
      displayOrder: 1,
      technologyIds: [],
    });
    await expect(persistence.findForAdminById('00000000-0000-4000-8000-000000000099')).resolves.toBeUndefined();
    try {
      const updated = await persistence.updateContent(draftId, { organization: 'Edited Draft Studio', role: 'Edited Draft Engineer', summary: 'Edited fictional draft content.', startDate: '2025-02-01', endDate: '2025-12-31' });
      expect(updated).toEqual({ id: draftId, organization: 'Edited Draft Studio', role: 'Edited Draft Engineer', summary: 'Edited fictional draft content.', location: null, organizationUrl: null, startDate: '2025-02-01', endDate: '2025-12-31', status: 'draft', featured: false, displayOrder: 1, technologyIds: [] });
      await expect(persistence.findPublished()).resolves.not.toContainEqual(expect.objectContaining({ organization: 'Edited Draft Studio' }));
    } finally {
      await persistence.updateContent(draftId, original);
    }
  });

  it('changes only the Experience location', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleExperiencePersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleExperiencePersistence);
    const id = '00000000-0000-4000-8000-000000000014';
    const original = await persistence.findForAdminById(id);
    try {
      await expect(persistence.updateLocation(id, 'Remote')).resolves.toEqual({ ...original, location: 'Remote' });
      await expect(persistence.updateLocation('00000000-0000-4000-8000-000000000099', null)).resolves.toBeUndefined();
    } finally {
      await persistence.updateLocation(id, original!.location);
    }
  });

  it('changes only the Experience organization URL', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleExperiencePersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleExperiencePersistence);
    const id = '00000000-0000-4000-8000-000000000014';
    const original = await persistence.findForAdminById(id);
    try {
      await expect(persistence.updateOrganizationUrl(id, 'https://example.invalid')).resolves.toEqual({ ...original, organizationUrl: 'https://example.invalid' });
      await expect(persistence.updateOrganizationUrl('00000000-0000-4000-8000-000000000099', null)).resolves.toBeUndefined();
    } finally {
      await persistence.updateOrganizationUrl(id, original!.organizationUrl);
    }
  });

  it('replaces Experience technologies atomically and preserves them across unrelated mutations', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleExperiencePersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleExperiencePersistence);
    const database = moduleFixture.get(DatabaseService);
    const id = '00000000-0000-4000-8000-000000000010';
    const ids = ['00000000-0000-4000-8000-000000000040', '00000000-0000-4000-8000-000000000041'];
    const original = await persistence.findForAdminById(id);
    try {
      await expect(persistence.updateTechnologies(id, { technologyIds: ids })).resolves.toMatchObject({ ...original, technologyIds: ids });
      const persistedTechnologyIds = (await persistence.findForAdminById(id))!.technologyIds;
      await expect(persistence.updateContent(id, { organization: original!.organization, role: original!.role, summary: original!.summary, startDate: original!.startDate, endDate: original!.endDate })).resolves.toMatchObject({ technologyIds: persistedTechnologyIds });
      await expect(persistence.updateTechnologies(id, { technologyIds: ['00000000-0000-4000-8000-000000000099'] })).resolves.toBeUndefined();
      await expect(persistence.findForAdminById(id)).resolves.toMatchObject({ technologyIds: persistedTechnologyIds });
      await expect(persistence.updateTechnologies(id, { technologyIds: [] })).resolves.toMatchObject({ technologyIds: [] });
    } finally {
      await database.db.delete(experienceTechnologies).where(eq(experienceTechnologies.experienceId, id));
      if (original!.technologyIds.length) await database.db.insert(experienceTechnologies).values(original!.technologyIds.map((technologyId) => ({ experienceId: id, technologyId })));
    }
  });

  it('publishes and archives the draft without changing its content or order', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleExperiencePersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleExperiencePersistence);
    const draftId = '00000000-0000-4000-8000-000000000014';
    const original = await persistence.findForAdminById(draftId);
    expect(original?.status).toBe('draft');
    try {
      await expect(persistence.updateStatus(draftId, 'published')).resolves.toEqual({ ...original, status: 'published' });
      await expect(persistence.findPublished()).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ organization: original?.organization })]));
      await expect(persistence.updateStatus(draftId, 'archived')).resolves.toEqual({ ...original, status: 'archived' });
      await expect(persistence.findPublished()).resolves.not.toContainEqual(expect.objectContaining({ organization: original?.organization }));
      await expect(persistence.updateStatus('00000000-0000-4000-8000-000000000099', 'published')).resolves.toBeUndefined();
    } finally {
      await persistence.updateStatus(draftId, 'draft');
    }
  });

  it('creates a server-owned draft at the end of the private sequence', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleExperiencePersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleExperiencePersistence);
    const database = moduleFixture.get(DatabaseService);
    const input = { organization: 'Temporary Creation Studio', role: 'Temporary Engineer', summary: 'Fictional temporary record for creation verification.', startDate: '2026-01-01', endDate: null };
    const prior = await persistence.findForAdmin();
    const created = await persistence.createDraft(input);
    try {
      expect(created).toMatchObject({
        ...input,
        status: 'draft',
        displayOrder: Math.max(...prior.map((experience) => experience.displayOrder)) + 1,
      });
      expect(created.id).toMatch(/^[0-9a-f-]{36}$/i);
      await expect(persistence.findForAdmin()).resolves.toEqual([...prior, created]);
      await expect(persistence.findPublished()).resolves.not.toContainEqual(expect.objectContaining({ organization: input.organization }));
    } finally {
      await database.db.delete(experiences).where(eq(experiences.id, created.id));
    }
  });

  it('moves adjacent Experience records without changing their content or status', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleExperiencePersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleExperiencePersistence);
    const firstId = '00000000-0000-4000-8000-000000000010'; const draftId = '00000000-0000-4000-8000-000000000014';
    const original = await persistence.findForAdmin();
    try {
      await expect(persistence.moveExperience('00000000-0000-4000-8000-000000000099', 'up')).resolves.toBeUndefined();
      const moved = await persistence.moveExperience(draftId, 'up');
      expect(moved?.map((experience) => experience.id)).toEqual([draftId, firstId]);
      expect(moved?.[0]).toMatchObject({ id: draftId, organization: 'Example Draft Studio', status: 'draft' });
      await expect(persistence.moveExperience(draftId, 'up')).resolves.toEqual(moved);
    } finally { await persistence.moveExperience(draftId, 'down'); }
    await expect(persistence.findForAdmin()).resolves.toEqual(original);
  });
});
