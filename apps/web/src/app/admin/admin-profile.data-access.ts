import { Observable } from 'rxjs';

export type AdminProfile = {
  headline: string;
  summary: string;
  about: string;
};

export abstract class AdminProfileDataAccess {
  abstract getProfile(): Observable<AdminProfile>;
  abstract updateContent(content: AdminProfile): Observable<AdminProfile>;
}
