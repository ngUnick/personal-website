export type PersistedProject = {
  slug: string;
  title: string;
  summary: string;
};

export interface ProjectsPersistence {
  findPublished(): Promise<PersistedProject[]>;
}

export const PROJECTS_PERSISTENCE = Symbol('PROJECTS_PERSISTENCE');
