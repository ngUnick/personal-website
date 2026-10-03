import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseModule } from '../database/database.module.js';
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
        summary: 'Temporary sample content used to validate the application path.',
      },
    ]);
  });
});
