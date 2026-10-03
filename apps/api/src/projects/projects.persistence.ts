export type PersistedProject = {
  slug: string;
  title: string;
  summary: string;
};

export interface ProjectsPersistence {
  findPublished(): Promise<PersistedProject[]>;
  findPublishedBySlug(slug: string): Promise<PersistedProject | undefined>;
}

export const PROJECTS_PERSISTENCE = Symbol('PROJECTS_PERSISTENCE');
