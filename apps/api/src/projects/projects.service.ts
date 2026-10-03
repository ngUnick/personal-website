import { Inject, Injectable } from '@nestjs/common';
import { ProjectResponseDto } from './project-response.dto.js';
import { PROJECTS_PERSISTENCE } from './projects.persistence.js';
import type { ProjectsPersistence } from './projects.persistence.js';

@Injectable()
export class ProjectsService {
  constructor(@Inject(PROJECTS_PERSISTENCE) private readonly projectsPersistence: ProjectsPersistence) {}

  async getProjects(): Promise<ProjectResponseDto[]> {
    return this.projectsPersistence.findPublished();
  }
}
