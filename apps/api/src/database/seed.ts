import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getDatabaseUrl } from './database-url.js';
import { projects } from './schema.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error('The development seed must not run in production.');
}

const pool = new Pool({ connectionString: getDatabaseUrl() });
const db = drizzle({ client: pool });

try {
  await db
    .insert(projects)
    .values({
      id: '00000000-0000-4000-8000-000000000001',
      slug: 'placeholder-project',
      title: 'Placeholder Project',
      summary:
        'Temporary sample content used to validate the application path.',
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
        status: 'published',
        featured: true,
        displayOrder: 0,
      },
    });
} finally {
  await pool.end();
}
