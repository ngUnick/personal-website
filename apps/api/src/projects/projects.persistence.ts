export type PersistedProject = {
  slug: string;
  title: string;
  summary: string;
};
export type AdminPersistedProject = PersistedProject & {
  status: ProjectPublicationStatus;
  featured: boolean;
  displayOrder: number;
};
export type ProjectPublicationStatus = 'draft' | 'published' | 'archived';
export type ProjectContentUpdate = Pick<PersistedProject, 'title' | 'summary'>;
export type CreateProjectDraft = Pick<PersistedProject, 'slug' | 'title' | 'summary'>;

export interface ProjectsPersistence {
  findPublished(): Promise<PersistedProject[]>;
  findFeaturedPublished(): Promise<PersistedProject[]>;
  findPublishedBySlug(slug: string): Promise<PersistedProject | undefined>;
  findForAdmin(): Promise<AdminPersistedProject[]>;
  findForAdminBySlug(slug: string): Promise<AdminPersistedProject | undefined>;
  updateFeatured(slug: string, featured: boolean): Promise<AdminPersistedProject | undefined>;
  updateContent(slug: string, content: ProjectContentUpdate): Promise<AdminPersistedProject | undefined>;
  updateStatus(slug: string, status: ProjectPublicationStatus): Promise<AdminPersistedProject | undefined>;
  createDraft(input: CreateProjectDraft): Promise<AdminPersistedProject | undefined>;
}

export const PROJECTS_PERSISTENCE = Symbol('PROJECTS_PERSISTENCE');
