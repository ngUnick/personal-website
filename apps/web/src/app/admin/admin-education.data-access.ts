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
  location: string | null;
  institutionUrl: string | null;
  startDate: string;
  endDate: string | null;
};
export type EducationContentUpdate = Pick<
  AdminEducationDetail,
  'institution' | 'qualification' | 'summary' | 'startDate' | 'endDate'
>;
export type CreateEducationDraft = EducationContentUpdate;
export type EducationOrderDirection = 'up' | 'down';

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
  abstract updateLocation(
    id: string,
    location: string | null,
  ): Observable<AdminEducationDetail>;
  abstract updateInstitutionUrl(id: string, institutionUrl: string | null): Observable<AdminEducationDetail>;
  abstract createDraft(
    input: CreateEducationDraft,
  ): Observable<AdminEducationDetail>;
  abstract moveEducation(
    id: string,
    direction: EducationOrderDirection,
  ): Observable<AdminEducation[]>;
}
