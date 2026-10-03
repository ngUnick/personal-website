import { Inject, Injectable } from '@nestjs/common';
import { ExperienceResponseDto } from './experience-response.dto.js';
import { EXPERIENCE_PERSISTENCE } from './experience.persistence.js';
import type { ExperiencePersistence } from './experience.persistence.js';

@Injectable()
export class ExperienceService {
  constructor(
    @Inject(EXPERIENCE_PERSISTENCE)
    private readonly experiencePersistence: ExperiencePersistence,
  ) {}

  async getExperience(): Promise<ExperienceResponseDto[]> {
    return this.experiencePersistence.findPublished();
  }
}
