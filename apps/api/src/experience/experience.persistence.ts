export type PersistedExperience = {
  organization: string;
  role: string;
  summary: string;
  startDate: string;
  endDate: string | null;
};

export type ExperiencePublicationStatus = 'draft' | 'published' | 'archived';

export type AdminPersistedExperience = PersistedExperience & {
  id: string;
  status: ExperiencePublicationStatus;
  displayOrder: number;
};

export type ExperienceContentUpdate = Pick<
  PersistedExperience,
  'organization' | 'role' | 'summary' | 'startDate' | 'endDate'
>;

export interface ExperiencePersistence {
  findPublished(): Promise<PersistedExperience[]>;
  findForAdmin(): Promise<AdminPersistedExperience[]>;
  findForAdminById(id: string): Promise<AdminPersistedExperience | undefined>;
  updateContent(id: string, content: ExperienceContentUpdate): Promise<AdminPersistedExperience | undefined>;
}

export const EXPERIENCE_PERSISTENCE = Symbol('EXPERIENCE_PERSISTENCE');
