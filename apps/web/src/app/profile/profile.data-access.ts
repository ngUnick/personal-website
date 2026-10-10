import { Observable } from 'rxjs';
export type Profile = { headline: string; summary: string; about: string; contactEmail: string | null };
export abstract class ProfileDataAccess { abstract getProfile(): Observable<Profile>; }
