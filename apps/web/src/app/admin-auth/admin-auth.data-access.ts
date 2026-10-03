import { Observable } from 'rxjs';
export abstract class AdminAuthDataAccess {
  abstract login(loginIdentifier: string, password: string): Observable<{ authenticated: boolean }>;
  abstract getSession(): Observable<{ authenticated: boolean; loginIdentifier?: string }>;
  abstract logout(): Observable<{ authenticated: boolean }>;
}
