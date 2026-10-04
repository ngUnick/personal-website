import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectResponseDto } from './project-response.dto.js';
import { PROJECTS_PERSISTENCE } from './projects.persistence.js';
import type { ProjectsPersistence } from './projects.persistence.js';
import type { AdminPersistedProject, ProjectPublicationStatus } from './projects.persistence.js';

export type AdminProject = Pick<
  AdminPersistedProject,
  'slug' | 'title' | 'status' | 'featured'
>;
export type AdminProjectDetail = Pick<
  AdminPersistedProject,
  'slug' | 'title' | 'summary' | 'status' | 'featured'
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

  async getAdminProject(slug: string): Promise<AdminProjectDetail> {
    const project = await this.projectsPersistence.findForAdminBySlug(slug);
    if (!project) throw new NotFoundException('Project not found.');
    return this.toAdminProjectDetail(project);
  }

  async updateContent(slug: string, title: string, summary: string): Promise<AdminProjectDetail> {
    const project = await this.projectsPersistence.updateContent(slug, { title, summary });
    if (!project) throw new NotFoundException('Project not found.');
    return this.toAdminProjectDetail(project);
  }

  async updateStatus(slug: string, status: ProjectPublicationStatus): Promise<AdminProjectDetail> {
    const project = await this.projectsPersistence.updateStatus(slug, status);
    if (!project) throw new NotFoundException('Project not found.');
    return this.toAdminProjectDetail(project);
  }

  private toAdminProject(project: AdminPersistedProject): AdminProject {
    const { slug, title, status, featured } = project;
    return { slug, title, status, featured };
  }

  private toAdminProjectDetail(project: AdminPersistedProject): AdminProjectDetail {
    const { slug, title, summary, status, featured } = project;
    return { slug, title, summary, status, featured };
  }
}
