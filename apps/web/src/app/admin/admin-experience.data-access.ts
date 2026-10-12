import { Observable } from 'rxjs';

export type ExperiencePublicationStatus = 'draft' | 'published' | 'archived';
export type AdminExperience = { id: string; organization: string; role: string; status: ExperiencePublicationStatus; featured: boolean };
export type AdminExperienceDetail = AdminExperience & { summary: string; location: string | null; organizationUrl: string | null; startDate: string; endDate: string | null; technologyIds: string[] };
export type ExperienceContentUpdate = Pick<AdminExperienceDetail, 'organization' | 'role' | 'summary' | 'startDate' | 'endDate'>;
export type CreateExperienceDraft = ExperienceContentUpdate;
export type ExperienceOrderDirection = 'up' | 'down';

export abstract class AdminExperienceDataAccess {
  abstract getExperiences(): Observable<AdminExperience[]>;
  abstract getExperience(id: string): Observable<AdminExperienceDetail>;
  abstract updateContent(id: string, content: ExperienceContentUpdate): Observable<AdminExperienceDetail>;
  abstract updateStatus(id: string, status: ExperiencePublicationStatus): Observable<AdminExperienceDetail>;
  abstract updateFeatured(id: string, featured: boolean): Observable<AdminExperienceDetail>;
  abstract updateLocation(id: string, location: string | null): Observable<AdminExperienceDetail>;
  abstract updateOrganizationUrl(id: string, organizationUrl: string | null): Observable<AdminExperienceDetail>;
  abstract updateTechnologies(id: string, technologyIds: string[]): Observable<AdminExperienceDetail>;
  abstract createDraft(input: CreateExperienceDraft): Observable<AdminExperienceDetail>;
  abstract moveExperience(id: string, direction: ExperienceOrderDirection): Observable<AdminExperience[]>;
}
