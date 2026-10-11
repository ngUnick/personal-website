import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseModule } from '../database/database.module.js';
import { DrizzleProfilePersistence } from './drizzle-profile.persistence.js';

describe('DrizzleProfilePersistence', () => {
  let moduleFixture: TestingModule;
  afterEach(async () => moduleFixture?.close());
  it('returns only the seeded public profile projection', async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [DrizzleProfilePersistence],
    }).compile();
    const persistence = moduleFixture.get(DrizzleProfilePersistence);
    const original = {
      headline: 'Example Software Engineer',
      summary:
        'Fictional profile summary used to validate the public home path.',
      about:
        'Fictional profile about text used to validate the public about path.',
      contactEmail: 'portfolio@example.invalid',
      githubUrl: null,
      linkedinUrl: null,
    };
    await expect(persistence.findPublic()).resolves.toEqual(original);
    const updated = {
      headline: 'Edited fictional headline',
      summary: 'Edited fictional profile summary.',
      about: 'Edited fictional profile about text.',
      contactEmail: 'portfolio@example.invalid',
      githubUrl: null,
      linkedinUrl: null,
    };
    try {
      await expect(persistence.updateContent(updated)).resolves.toEqual(
        updated,
      );
      await expect(persistence.findPublic()).resolves.toEqual(updated);
      const contactUpdated = {
        ...updated,
        contactEmail: 'edited@example.invalid',
      };
      await expect(
        persistence.updateContact({
          contactEmail: contactUpdated.contactEmail,
        }),
      ).resolves.toEqual(contactUpdated);
      const linksUpdated = {
        ...contactUpdated,
        githubUrl: 'https://github.com/example',
        linkedinUrl: 'https://www.linkedin.com/in/example',
      };
      await expect(
        persistence.updateLinks({
          githubUrl: linksUpdated.githubUrl,
          linkedinUrl: linksUpdated.linkedinUrl,
        }),
      ).resolves.toEqual(linksUpdated);
      await expect(persistence.findPublic()).resolves.toEqual(linksUpdated);
    } finally {
      await persistence.updateContent(original);
      await persistence.updateContact({ contactEmail: original.contactEmail });
      await persistence.updateLinks({
        githubUrl: original.githubUrl,
        linkedinUrl: original.linkedinUrl,
      });
    }
  });
});
