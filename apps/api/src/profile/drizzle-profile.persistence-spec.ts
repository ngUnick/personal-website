import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseModule } from '../database/database.module.js';
import { DrizzleProfilePersistence } from './drizzle-profile.persistence.js';

describe('DrizzleProfilePersistence', () => {
  let moduleFixture: TestingModule;
  afterEach(async () => moduleFixture?.close());
  it('returns only the seeded public profile projection', async () => {
    moduleFixture = await Test.createTestingModule({ imports: [DatabaseModule], providers: [DrizzleProfilePersistence] }).compile();
    const persistence = moduleFixture.get(DrizzleProfilePersistence);
    const original = {
      headline: 'Example Software Engineer',
      summary: 'Fictional profile summary used to validate the public home path.',
      about: 'Fictional profile about text used to validate the public about path.',
      contactEmail: 'portfolio@example.invalid',
    };
    await expect(persistence.findPublic()).resolves.toEqual(original);
    const updated = {
      headline: 'Edited fictional headline',
      summary: 'Edited fictional profile summary.',
      about: 'Edited fictional profile about text.',
      contactEmail: 'portfolio@example.invalid',
    };
    try {
      await expect(persistence.updateContent(updated)).resolves.toEqual(updated);
      await expect(persistence.findPublic()).resolves.toEqual(updated);
      await expect(persistence.updateContact({ contactEmail: 'edited@example.invalid' })).resolves.toEqual({ ...updated, contactEmail: 'edited@example.invalid' });
    } finally {
      await persistence.updateContent(original);
      await persistence.updateContact({ contactEmail: original.contactEmail });
    }
  });
});
