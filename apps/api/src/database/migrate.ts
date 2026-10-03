import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getDatabaseUrl } from './database-url.js';

const pool = new Pool({ connectionString: getDatabaseUrl() });
const db = drizzle({ client: pool });
const migrationsFolder = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

try {
  await migrate(db, { migrationsFolder });
} finally {
  await pool.end();
}
