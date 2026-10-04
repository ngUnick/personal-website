export type PersistedProject = {
  slug: string;
  title: string;
  summary: string;
};
export type AdminPersistedProject = PersistedProject & {
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  displayOrder: number;
};
export type ProjectContentUpdate = Pick<PersistedProject, 'title' | 'summary'>;

export interface ProjectsPersistence {
  findPublished(): Promise<PersistedProject[]>;
  findFeaturedPublished(): Promise<PersistedProject[]>;
  findPublishedBySlug(slug: string): Promise<PersistedProject | undefined>;
  findForAdmin(): Promise<AdminPersistedProject[]>;
  findForAdminBySlug(slug: string): Promise<AdminPersistedProject | undefined>;
  updateFeatured(slug: string, featured: boolean): Promise<AdminPersistedProject | undefined>;
  updateContent(slug: string, content: ProjectContentUpdate): Promise<AdminPersistedProject | undefined>;
}

export const PROJECTS_PERSISTENCE = Symbol('PROJECTS_PERSISTENCE');
