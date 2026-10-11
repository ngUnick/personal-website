export type PersistedExperience = {
  organization: string;
  role: string;
  summary: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
};

export type ExperiencePublicationStatus = 'draft' | 'published' | 'archived';

export type AdminPersistedExperience = PersistedExperience & {
  id: string;
  status: ExperiencePublicationStatus;
  featured: boolean;
  displayOrder: number;
};

export type ExperienceContentUpdate = Pick<
  PersistedExperience,
  'organization' | 'role' | 'summary' | 'startDate' | 'endDate'
>;
export type CreateExperienceDraft = ExperienceContentUpdate;
export type ExperienceOrderDirection = 'up' | 'down';

export interface ExperiencePersistence {
  findPublished(): Promise<PersistedExperience[]>;
  findFeaturedPublished(): Promise<PersistedExperience[]>;
  findForAdmin(): Promise<AdminPersistedExperience[]>;
  findForAdminById(id: string): Promise<AdminPersistedExperience | undefined>;
  updateContent(id: string, content: ExperienceContentUpdate): Promise<AdminPersistedExperience | undefined>;
  updateStatus(id: string, status: ExperiencePublicationStatus): Promise<AdminPersistedExperience | undefined>;
  updateFeatured(id: string, featured: boolean): Promise<AdminPersistedExperience | undefined>;
  updateLocation(id: string, location: string | null): Promise<AdminPersistedExperience | undefined>;
  createDraft(input: CreateExperienceDraft): Promise<AdminPersistedExperience>;
  moveExperience(id: string, direction: ExperienceOrderDirection): Promise<AdminPersistedExperience[] | undefined>;
}

export const EXPERIENCE_PERSISTENCE = Symbol('EXPERIENCE_PERSISTENCE');
