import { Observable } from 'rxjs';
export type Profile = {
  headline: string;
  summary: string;
  about: string;
  contactEmail: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
};
export abstract class ProfileDataAccess {
  abstract getProfile(): Observable<Profile>;
}
