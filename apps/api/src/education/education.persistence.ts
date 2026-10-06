export type PublicEducation = {
  institution: string;
  qualification: string;
  summary: string;
  startDate: string;
  endDate: string | null;
};

export interface EducationPersistence {
  findPublished(): Promise<PublicEducation[]>;
}

export const EDUCATION_PERSISTENCE = Symbol('EDUCATION_PERSISTENCE');
