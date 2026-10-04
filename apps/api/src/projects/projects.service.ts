import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectResponseDto } from './project-response.dto.js';
import { PROJECTS_PERSISTENCE } from './projects.persistence.js';
import type { ProjectsPersistence } from './projects.persistence.js';
import type { AdminPersistedProject } from './projects.persistence.js';

export type AdminProject = Pick<
  AdminPersistedProject,
  'slug' | 'title' | 'status' | 'featured'
>;

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECTS_PERSISTENCE)
    private readonly projectsPersistence: ProjectsPersistence,
  ) {}

  async getProjects(): Promise<ProjectResponseDto[]> {
    return this.projectsPersistence.findPublished();
  }

  async getFeaturedProjects(): Promise<ProjectResponseDto[]> {
    return this.projectsPersistence.findFeaturedPublished();
  }

  async getProject(slug: string): Promise<ProjectResponseDto> {
    const project = await this.projectsPersistence.findPublishedBySlug(slug);

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return project;
  }

  async getAdminProjects(): Promise<AdminProject[]> {
    const projects = await this.projectsPersistence.findForAdmin();
    return projects.map((project) => this.toAdminProject(project));
  }

  async updateFeatured(slug: string, featured: boolean): Promise<AdminProject> {
    const project = await this.projectsPersistence.updateFeatured(slug, featured);
    if (!project) throw new NotFoundException('Project not found.');
    return this.toAdminProject(project);
  }

  private toAdminProject(project: AdminPersistedProject): AdminProject {
    const { slug, title, status, featured } = project;
    return { slug, title, status, featured };
  }
}
