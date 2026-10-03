export type PersistedExperience = {
  organization: string;
  role: string;
  summary: string;
  startDate: string;
  endDate: string | null;
};

export interface ExperiencePersistence {
  findPublished(): Promise<PersistedExperience[]>;
}

export const EXPERIENCE_PERSISTENCE = Symbol('EXPERIENCE_PERSISTENCE');
