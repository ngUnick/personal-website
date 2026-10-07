import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseModule } from '../database/database.module.js';
import { DrizzleCredentialPersistence } from './drizzle-credential.persistence.js';

describe('DrizzleCredentialPersistence', () => {
  let moduleFixture: TestingModule;

  afterEach(async () => moduleFixture?.close());

  it('lists and edits the deterministic Draft without changing server-owned fields', async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [DrizzleCredentialPersistence],
    }).compile();
    const persistence = moduleFixture.get(DrizzleCredentialPersistence);
    const id = '00000000-0000-4000-8000-000000000050';
    const original = await persistence.findForAdminById(id);

    try {
      await expect(persistence.findForAdmin()).resolves.toEqual([
        {
          id,
          name: 'Example Draft Credential',
          issuer: 'Example Learning Provider',
          issuedOn: '2025-01-01',
          status: 'draft',
          displayOrder: 0,
        },
      ]);
      await expect(
        persistence.updateContent(id, {
          name: 'Edited Draft Credential',
          issuer: 'Edited Learning Provider',
          issuedOn: '2025-02-01',
        }),
      ).resolves.toEqual({
        id,
        name: 'Edited Draft Credential',
        issuer: 'Edited Learning Provider',
        issuedOn: '2025-02-01',
        status: 'draft',
        displayOrder: 0,
      });
      await expect(
        persistence.updateContent('00000000-0000-4000-8000-000000000099', {
          name: 'Missing',
          issuer: 'Missing',
          issuedOn: '2025-01-01',
        }),
      ).resolves.toBeUndefined();
    } finally {
      if (original) await persistence.updateContent(id, original);
    }
  });

  it('changes only the lifecycle status and restores the Draft', async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [DrizzleCredentialPersistence],
    }).compile();
    const persistence = moduleFixture.get(DrizzleCredentialPersistence);
    const id = '00000000-0000-4000-8000-000000000050';
    const original = await persistence.findForAdminById(id);

    try {
      await expect(persistence.updateStatus(id, 'published')).resolves.toEqual({ ...original, status: 'published' });
      await expect(persistence.updateStatus(id, 'archived')).resolves.toEqual({ ...original, status: 'archived' });
      await expect(persistence.updateStatus('00000000-0000-4000-8000-000000000099', 'published')).resolves.toBeUndefined();
    } finally {
      if (original) await persistence.updateStatus(id, original.status);
    }
  });
});
