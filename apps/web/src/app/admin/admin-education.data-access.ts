import { Observable } from 'rxjs';

export type EducationPublicationStatus = 'draft' | 'published' | 'archived';
export type AdminEducation = {
  id: string;
  institution: string;
  qualification: string;
  status: EducationPublicationStatus;
};
export type AdminEducationDetail = AdminEducation & {
  summary: string;
  startDate: string;
  endDate: string | null;
};
export type EducationContentUpdate = Pick<
  AdminEducationDetail,
  'institution' | 'qualification' | 'summary' | 'startDate' | 'endDate'
>;
export type CreateEducationDraft = EducationContentUpdate;

export abstract class AdminEducationDataAccess {
  abstract getEducations(): Observable<AdminEducation[]>;
  abstract getEducation(id: string): Observable<AdminEducationDetail>;
  abstract updateContent(
    id: string,
    content: EducationContentUpdate,
  ): Observable<AdminEducationDetail>;
  abstract updateStatus(
    id: string,
    status: EducationPublicationStatus,
  ): Observable<AdminEducationDetail>;
  abstract createDraft(
    input: CreateEducationDraft,
  ): Observable<AdminEducationDetail>;
}
