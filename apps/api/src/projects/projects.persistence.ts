export type PersistedProject = {
  slug: string;
  title: string;
  summary: string;
};
export type PersistedProjectDetail = PersistedProject & { caseStudy: string };
export type AdminPersistedProject = PersistedProject & {
  status: ProjectPublicationStatus;
  featured: boolean;
  displayOrder: number;
} & { caseStudy: string };
export type ProjectPublicationStatus = 'draft' | 'published' | 'archived';
export type ProjectContentUpdate = Pick<PersistedProjectDetail, 'title' | 'summary' | 'caseStudy'>;
export type CreateProjectDraft = Pick<PersistedProject, 'slug' | 'title' | 'summary'>;
export type ProjectOrderDirection = 'up' | 'down';

export interface ProjectsPersistence {
  findPublished(): Promise<PersistedProject[]>;
  findFeaturedPublished(): Promise<PersistedProject[]>;
  findPublishedBySlug(slug: string): Promise<PersistedProjectDetail | undefined>;
  findForAdmin(): Promise<AdminPersistedProject[]>;
  findForAdminBySlug(slug: string): Promise<AdminPersistedProject | undefined>;
  updateFeatured(slug: string, featured: boolean): Promise<AdminPersistedProject | undefined>;
  updateContent(slug: string, content: ProjectContentUpdate): Promise<AdminPersistedProject | undefined>;
  updateStatus(slug: string, status: ProjectPublicationStatus): Promise<AdminPersistedProject | undefined>;
  moveProject(slug: string, direction: ProjectOrderDirection): Promise<AdminPersistedProject[] | undefined>;
  createDraft(input: CreateProjectDraft): Promise<AdminPersistedProject | undefined>;
}

export const PROJECTS_PERSISTENCE = Symbol('PROJECTS_PERSISTENCE');
