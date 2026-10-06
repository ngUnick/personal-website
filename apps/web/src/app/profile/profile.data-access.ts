import { Observable } from 'rxjs';
export type Profile = { headline: string; summary: string; about: string };
export abstract class ProfileDataAccess { abstract getProfile(): Observable<Profile>; }
