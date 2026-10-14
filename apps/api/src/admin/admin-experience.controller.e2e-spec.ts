import { describe, expect, it, vi } from 'vitest';
import { AdminExperienceController } from './admin-experience.controller.js';
import type { ExperienceService } from '../experience/experience.service.js';

describe('AdminExperienceController', () => {
  it('delegates UUID draft deletion without accepting a request body', async () => {
    const deleteDraft = vi.fn().mockResolvedValue(undefined);
    const controller = new AdminExperienceController({ deleteDraft } as unknown as ExperienceService);
    const id = '00000000-0000-4000-8000-000000000071';

    await expect(controller.deleteDraft(id)).resolves.toBeUndefined();
    expect(deleteDraft).toHaveBeenCalledWith(id);
  });
});
