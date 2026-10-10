import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getDatabaseUrl } from './database-url.js';
import { adminUsers, credentials, educations, experiences, profiles, projects, technologies } from './schema.js';
import { hashPassword } from '../admin-auth/password.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error('The development seed must not run in production.');
}

const pool = new Pool({ connectionString: getDatabaseUrl() });
const db = drizzle({ client: pool });

try {
  await db.insert(credentials).values({ id: '00000000-0000-4000-8000-000000000050', name: 'Example Draft Credential', issuer: 'Example Learning Provider', issuedOn: '2025-01-01', status: 'draft', displayOrder: 0 }).onConflictDoUpdate({ target: credentials.id, set: { name: 'Example Draft Credential', issuer: 'Example Learning Provider', issuedOn: '2025-01-01', status: 'draft', displayOrder: 0 } });
  for (const technology of [
    { id: '00000000-0000-4000-8000-000000000040', name: 'Example TypeScript', category: 'Languages', status: 'published' as const, displayOrder: 0 },
    { id: '00000000-0000-4000-8000-000000000041', name: 'Example PostgreSQL', category: 'Data', status: 'published' as const, displayOrder: 1 },
    { id: '00000000-0000-4000-8000-000000000042', name: 'Example Draft Tool', category: 'Tools', status: 'draft' as const, displayOrder: 2 },
  ]) {
    await db.insert(technologies).values(technology).onConflictDoUpdate({ target: technologies.id, set: { name: technology.name, category: technology.category, status: technology.status, displayOrder: technology.displayOrder } });
  }
  await db.insert(profiles).values({ id: 1, headline: 'Example Software Engineer', summary: 'Fictional profile summary used to validate the public home path.', about: 'Fictional profile about text used to validate the public about path.', contactEmail: 'portfolio@example.invalid' }).onConflictDoUpdate({ target: profiles.id, set: { headline: 'Example Software Engineer', summary: 'Fictional profile summary used to validate the public home path.', about: 'Fictional profile about text used to validate the public about path.', contactEmail: 'portfolio@example.invalid' } });
  const fakeAdminPasswordHash = await hashPassword('development-only-password');
  await db
    .insert(educations)
    .values({
      id: '00000000-0000-4000-8000-000000000030',
      institution: 'Example Technical Institute',
      qualification: 'Example Software Engineering Diploma',
      summary:
        'Fictional education fixture used to validate the public homepage path.',
      startDate: '2020-01-01',
      endDate: '2023-01-01',
      status: 'published',
      displayOrder: 0,
    })
    .onConflictDoUpdate({
      target: educations.id,
      set: {
        institution: 'Example Technical Institute',
        qualification: 'Example Software Engineering Diploma',
        summary:
          'Fictional education fixture used to validate the public homepage path.',
        startDate: '2020-01-01',
        endDate: '2023-01-01',
        status: 'published',
        displayOrder: 0,
      },
    });

  await db
    .insert(educations)
    .values({
      id: '00000000-0000-4000-8000-000000000034',
      institution: 'Example Draft Institute',
      qualification: 'Example Draft Software Program',
      summary:
        'Fictional draft education used only to validate private CMS authoring.',
      startDate: '2024-01-01',
      endDate: null,
      status: 'draft',
      displayOrder: 1,
    })
    .onConflictDoUpdate({
      target: educations.id,
      set: {
        institution: 'Example Draft Institute',
        qualification: 'Example Draft Software Program',
        summary:
          'Fictional draft education used only to validate private CMS authoring.',
        startDate: '2024-01-01',
        endDate: null,
        status: 'draft',
        displayOrder: 1,
      },
    });

  await db
    .insert(adminUsers)
    .values({
      id: '00000000-0000-4000-8000-000000000020',
      loginIdentifier: 'fake-admin',
      passwordHash: fakeAdminPasswordHash,
    })
    .onConflictDoUpdate({
      target: adminUsers.loginIdentifier,
      set: { passwordHash: fakeAdminPasswordHash },
    });

  await db
    .insert(projects)
    .values({
      id: '00000000-0000-4000-8000-000000000001',
      slug: 'placeholder-project',
      title: 'Placeholder Project',
      summary:
        'Temporary sample content used to validate the application path.',
      caseStudy:
        'Fictional narrative used to validate the published project detail path.\n\nIt is deliberately not personal portfolio content.',
      status: 'published',
      featured: true,
      displayOrder: 0,
    })
    .onConflictDoUpdate({
      target: projects.slug,
      set: {
        title: 'Placeholder Project',
        summary:
          'Temporary sample content used to validate the application path.',
        caseStudy:
          'Fictional narrative used to validate the published project detail path.\n\nIt is deliberately not personal portfolio content.',
        status: 'published',
        featured: true,
        displayOrder: 0,
      },
    });

  await db
    .insert(projects)
    .values({
      id: '00000000-0000-4000-8000-000000000004',
      slug: 'draft-placeholder-project',
      title: 'Draft Placeholder Project',
      summary:
        'Fictional draft content used only to validate private project authoring.',
      caseStudy:
        'Fictional draft narrative used only to validate private case-study authoring.',
      status: 'draft',
      featured: false,
      displayOrder: 1,
    })
    .onConflictDoUpdate({
      target: projects.slug,
      set: {
        title: 'Draft Placeholder Project',
        summary:
          'Fictional draft content used only to validate private project authoring.',
        caseStudy:
          'Fictional draft narrative used only to validate private case-study authoring.',
        status: 'draft',
        featured: false,
        displayOrder: 1,
      },
    });

  await db
    .insert(experiences)
    .values({
      id: '00000000-0000-4000-8000-000000000010',
      organization: 'Example Software Studio',
      role: 'Example Software Engineer',
      summary:
        'Fictional development fixture used to validate the public experience path.',
      startDate: '2024-01-01',
      endDate: null,
      status: 'published',
      displayOrder: 0,
    })
    .onConflictDoUpdate({
      target: experiences.id,
      set: {
        organization: 'Example Software Studio',
        role: 'Example Software Engineer',
        summary:
          'Fictional development fixture used to validate the public experience path.',
        startDate: '2024-01-01',
        endDate: null,
        status: 'published',
        displayOrder: 0,
      },
    });

  await db
    .insert(experiences)
    .values({
      id: '00000000-0000-4000-8000-000000000014',
      organization: 'Example Draft Studio',
      role: 'Example Draft Engineer',
      summary:
        'Fictional draft experience used only to validate private CMS authoring.',
      startDate: '2025-01-01',
      endDate: null,
      status: 'draft',
      displayOrder: 1,
    })
    .onConflictDoUpdate({
      target: experiences.id,
      set: {
        organization: 'Example Draft Studio',
        role: 'Example Draft Engineer',
        summary:
          'Fictional draft experience used only to validate private CMS authoring.',
        startDate: '2025-01-01',
        endDate: null,
        status: 'draft',
        displayOrder: 1,
      },
    });
} finally {
  await pool.end();
}
