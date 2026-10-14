export type PersistedExperience = {
  organization: string;
  role: string;
  summary: string;
  location: string | null;
  organizationUrl: string | null;
  startDate: string;
  endDate: string | null;
  technologies?: { name: string; category: string }[];
};

export type PublicPersistedExperience = Omit<PersistedExperience, 'technologies'> & {
  technologies: { name: string; category: string }[];
};

export type ExperiencePublicationStatus = 'draft' | 'published' | 'archived';

export type AdminPersistedExperience = PersistedExperience & {
  id: string;
  status: ExperiencePublicationStatus;
  featured: boolean;
  displayOrder: number;
  technologyIds?: string[];
};

export type ExperienceContentUpdate = Pick<
  PersistedExperience,
  'organization' | 'role' | 'summary' | 'startDate' | 'endDate'
>;
export type CreateExperienceDraft = ExperienceContentUpdate;
export type ExperienceOrderDirection = 'up' | 'down';
export type ExperienceTechnologyUpdate = { technologyIds: string[] };

export interface ExperiencePersistence {
  findPublished(): Promise<PublicPersistedExperience[]>;
  findFeaturedPublished(): Promise<PublicPersistedExperience[]>;
  findForAdmin(): Promise<AdminPersistedExperience[]>;
  findForAdminById(id: string): Promise<AdminPersistedExperience | undefined>;
  updateContent(id: string, content: ExperienceContentUpdate): Promise<AdminPersistedExperience | undefined>;
  updateStatus(id: string, status: ExperiencePublicationStatus): Promise<AdminPersistedExperience | undefined>;
  updateFeatured(id: string, featured: boolean): Promise<AdminPersistedExperience | undefined>;
  updateLocation(id: string, location: string | null): Promise<AdminPersistedExperience | undefined>;
  updateOrganizationUrl(id: string, organizationUrl: string | null): Promise<AdminPersistedExperience | undefined>;
  updateTechnologies(id: string, input: ExperienceTechnologyUpdate): Promise<AdminPersistedExperience | undefined>;
  createDraft(input: CreateExperienceDraft): Promise<AdminPersistedExperience>;
  deleteDraft(id: string): Promise<boolean>;
  moveExperience(id: string, direction: ExperienceOrderDirection): Promise<AdminPersistedExperience[] | undefined>;
}

export const EXPERIENCE_PERSISTENCE = Symbol('EXPERIENCE_PERSISTENCE');
