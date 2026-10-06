export type PublicEducation = {
  institution: string;
  qualification: string;
  summary: string;
  startDate: string;
  endDate: string | null;
};

export type EducationPublicationStatus = 'draft' | 'published' | 'archived';

export type AdminPersistedEducation = PublicEducation & {
  id: string;
  status: EducationPublicationStatus;
  displayOrder: number;
};

export type EducationContentUpdate = Pick<
  PublicEducation,
  'institution' | 'qualification' | 'summary' | 'startDate' | 'endDate'
>;
export type CreateEducationDraft = EducationContentUpdate;
export type EducationOrderDirection = 'up' | 'down';

export interface EducationPersistence {
  findPublished(): Promise<PublicEducation[]>;
  findForAdmin(): Promise<AdminPersistedEducation[]>;
  findForAdminById(id: string): Promise<AdminPersistedEducation | undefined>;
  updateContent(
    id: string,
    content: EducationContentUpdate,
  ): Promise<AdminPersistedEducation | undefined>;
  updateStatus(
    id: string,
    status: EducationPublicationStatus,
  ): Promise<AdminPersistedEducation | undefined>;
  createDraft(input: CreateEducationDraft): Promise<AdminPersistedEducation>;
  moveEducation(
    id: string,
    direction: EducationOrderDirection,
  ): Promise<AdminPersistedEducation[] | undefined>;
}

export const EDUCATION_PERSISTENCE = Symbol('EDUCATION_PERSISTENCE');
