import { Observable } from 'rxjs';

export type ExperiencePublicationStatus = 'draft' | 'published' | 'archived';
export type AdminExperience = { id: string; organization: string; role: string; status: ExperiencePublicationStatus };
export type AdminExperienceDetail = AdminExperience & { summary: string; startDate: string; endDate: string | null };
export type ExperienceContentUpdate = Pick<AdminExperienceDetail, 'organization' | 'role' | 'summary' | 'startDate' | 'endDate'>;

export abstract class AdminExperienceDataAccess {
  abstract getExperiences(): Observable<AdminExperience[]>;
  abstract getExperience(id: string): Observable<AdminExperienceDetail>;
  abstract updateContent(id: string, content: ExperienceContentUpdate): Observable<AdminExperienceDetail>;
}
