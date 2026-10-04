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

export interface ProjectsPersistence {
  findPublished(): Promise<PersistedProject[]>;
  findFeaturedPublished(): Promise<PersistedProject[]>;
  findPublishedBySlug(slug: string): Promise<PersistedProject | undefined>;
  findForAdmin(): Promise<AdminPersistedProject[]>;
  updateFeatured(slug: string, featured: boolean): Promise<AdminPersistedProject | undefined>;
}

export const PROJECTS_PERSISTENCE = Symbol('PROJECTS_PERSISTENCE');
