import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getDatabaseUrl } from './database-url.js';
import * as schema from './schema.js';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool = new Pool({ connectionString: getDatabaseUrl() });
  readonly db = drizzle({ client: this.pool, schema });

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
