import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdminProjectsController } from './admin-projects.controller.js';
import type { ProjectsService } from '../projects/projects.service.js';

describe('AdminProjectsController', () => {
  it('trims a project role and delegates only the role update', async () => {
    const updateRole = vi.fn().mockResolvedValue({ slug: 'placeholder-project', role: 'Software Engineer' });
    const controller = new AdminProjectsController({ updateRole } as unknown as ProjectsService);

    await expect(controller.updateRole('placeholder-project', { role: ' Software Engineer ' })).resolves.toEqual({ slug: 'placeholder-project', role: 'Software Engineer' });
    expect(updateRole).toHaveBeenCalledWith('placeholder-project', 'Software Engineer');
  });

  it('allows clearing a project role and rejects missing, blank, and non-string values', async () => {
    const updateRole = vi.fn().mockResolvedValue({ slug: 'placeholder-project', role: null });
    const controller = new AdminProjectsController({ updateRole } as unknown as ProjectsService);

    await expect(controller.updateRole('placeholder-project', { role: null })).resolves.toEqual({ slug: 'placeholder-project', role: null });
    for (const body of [{}, { role: '' }, { role: '   ' }, { role: 7 }]) {
      expect(() => controller.updateRole('placeholder-project', body as never)).toThrow(BadRequestException);
    }
  });

  it('delegates draft deletion without accepting a request body', async () => {
    const deleteDraft = vi.fn().mockResolvedValue(undefined);
    const controller = new AdminProjectsController({ deleteDraft } as unknown as ProjectsService);

    await expect(controller.deleteDraft('draft-placeholder-project')).resolves.toBeUndefined();
    expect(deleteDraft).toHaveBeenCalledWith('draft-placeholder-project');
  });
});
