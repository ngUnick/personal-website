import { Observable } from 'rxjs';

export type AdminProfile = {
  headline: string;
  summary: string;
  about: string;
  contactEmail: string | null;
};

export type ProfileContent = Pick<AdminProfile, 'headline' | 'summary' | 'about'>;

export abstract class AdminProfileDataAccess {
  abstract getProfile(): Observable<AdminProfile>;
  abstract updateContent(content: ProfileContent): Observable<AdminProfile>;
  abstract updateContact(contactEmail: string | null): Observable<AdminProfile>;
}
