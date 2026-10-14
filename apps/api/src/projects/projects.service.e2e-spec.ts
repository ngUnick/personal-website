import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ProjectsService } from './projects.service.js';

describe('ProjectsService.deleteDraft', () => {
  const project = (status: 'draft' | 'published' | 'archived') => ({ slug: 'project', title: 'Project', summary: 'Summary', role: null, startedOn: null, completedOn: null, caseStudy: '', repositoryUrl: null, liveUrl: null, status, featured: false, displayOrder: 0, technologyIds: [] });

  it('deletes only a Draft after loading it', async () => {
    const persistence = { findForAdminBySlug: vi.fn().mockResolvedValue(project('draft')), deleteDraft: vi.fn().mockResolvedValue(true) };
    await expect(new ProjectsService(persistence as never).deleteDraft('project')).resolves.toBeUndefined();
    expect(persistence.deleteDraft).toHaveBeenCalledWith('project');
  });

  it('rejects missing and lifecycle-managed Projects without deleting them', async () => {
    const persistence = { findForAdminBySlug: vi.fn(), deleteDraft: vi.fn() };
    const service = new ProjectsService(persistence as never);
    persistence.findForAdminBySlug.mockResolvedValueOnce(undefined);
    await expect(service.deleteDraft('missing')).rejects.toBeInstanceOf(NotFoundException);
    persistence.findForAdminBySlug.mockResolvedValueOnce(project('published'));
    await expect(service.deleteDraft('published')).rejects.toBeInstanceOf(ConflictException);
    persistence.findForAdminBySlug.mockResolvedValueOnce(project('archived'));
    await expect(service.deleteDraft('archived')).rejects.toBeInstanceOf(ConflictException);
    expect(persistence.deleteDraft).not.toHaveBeenCalled();
  });

  it('treats a failed conditional delete as not found', async () => {
    const persistence = { findForAdminBySlug: vi.fn().mockResolvedValue(project('draft')), deleteDraft: vi.fn().mockResolvedValue(false) };
    await expect(new ProjectsService(persistence as never).deleteDraft('project')).rejects.toBeInstanceOf(NotFoundException);
  });
});
