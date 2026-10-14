import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ExperienceService } from './experience.service.js';

describe('ExperienceService.deleteDraft', () => {
  const experience = (status: 'draft' | 'published' | 'archived') => ({ id: '00000000-0000-4000-8000-000000000071', organization: 'Example', role: 'Engineer', summary: 'Summary', location: null, organizationUrl: null, startDate: '2025-01-01', endDate: null, status, featured: false, displayOrder: 0, technologyIds: [] });

  it('deletes only a Draft after loading it', async () => {
    const persistence = { findForAdminById: vi.fn().mockResolvedValue(experience('draft')), deleteDraft: vi.fn().mockResolvedValue(true) };
    await expect(new ExperienceService(persistence as never).deleteDraft(experience('draft').id)).resolves.toBeUndefined();
    expect(persistence.deleteDraft).toHaveBeenCalledWith(experience('draft').id);
  });

  it('rejects missing and lifecycle-managed Experiences without deleting them', async () => {
    const persistence = { findForAdminById: vi.fn(), deleteDraft: vi.fn() };
    const service = new ExperienceService(persistence as never);
    persistence.findForAdminById.mockResolvedValueOnce(undefined);
    await expect(service.deleteDraft('00000000-0000-4000-8000-000000000099')).rejects.toBeInstanceOf(NotFoundException);
    persistence.findForAdminById.mockResolvedValueOnce(experience('published'));
    await expect(service.deleteDraft(experience('published').id)).rejects.toBeInstanceOf(ConflictException);
    persistence.findForAdminById.mockResolvedValueOnce(experience('archived'));
    await expect(service.deleteDraft(experience('archived').id)).rejects.toBeInstanceOf(ConflictException);
    expect(persistence.deleteDraft).not.toHaveBeenCalled();
  });

  it('treats a failed conditional delete as not found', async () => {
    const persistence = { findForAdminById: vi.fn().mockResolvedValue(experience('draft')), deleteDraft: vi.fn().mockResolvedValue(false) };
    await expect(new ExperienceService(persistence as never).deleteDraft(experience('draft').id)).rejects.toBeInstanceOf(NotFoundException);
  });
});
