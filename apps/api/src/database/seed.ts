import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getDatabaseUrl } from './database-url.js';
import { adminUsers, experiences, projects } from './schema.js';
import { hashPassword } from '../admin-auth/password.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error('The development seed must not run in production.');
}

const pool = new Pool({ connectionString: getDatabaseUrl() });
const db = drizzle({ client: pool });

try {
  const fakeAdminPasswordHash = await hashPassword('development-only-password');
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
      caseStudy: 'Fictional narrative used to validate the published project detail path.\n\nIt is deliberately not personal portfolio content.',
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
        caseStudy: 'Fictional narrative used to validate the published project detail path.\n\nIt is deliberately not personal portfolio content.',
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
      summary: 'Fictional draft content used only to validate private project authoring.',
      caseStudy: 'Fictional draft narrative used only to validate private case-study authoring.',
      status: 'draft',
      featured: false,
      displayOrder: 1,
    })
    .onConflictDoUpdate({
      target: projects.slug,
      set: {
        title: 'Draft Placeholder Project',
        summary: 'Fictional draft content used only to validate private project authoring.',
        caseStudy: 'Fictional draft narrative used only to validate private case-study authoring.',
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
} finally {
  await pool.end();
}
