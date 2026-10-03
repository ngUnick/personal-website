import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectResponseDto } from './project-response.dto.js';
import { PROJECTS_PERSISTENCE } from './projects.persistence.js';
import type { ProjectsPersistence } from './projects.persistence.js';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECTS_PERSISTENCE)
    private readonly projectsPersistence: ProjectsPersistence,
  ) {}

  async getProjects(): Promise<ProjectResponseDto[]> {
    return this.projectsPersistence.findPublished();
  }

  async getProject(slug: string): Promise<ProjectResponseDto> {
    const project = await this.projectsPersistence.findPublishedBySlug(slug);

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return project;
  }
}
