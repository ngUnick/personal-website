import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api-base-url';
import { AdminAuthDataAccess } from './admin-auth.data-access';
@Injectable()
export class AdminAuthHttpService extends AdminAuthDataAccess {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  login(loginIdentifier: string, password: string): Observable<{ authenticated: boolean }> { return this.http.post<{ authenticated: boolean }>(`${this.apiBaseUrl}/admin-auth/login`, { loginIdentifier, password }, { withCredentials: true }); }
  getSession(): Observable<{ authenticated: boolean; loginIdentifier?: string }> { return this.http.get<{ authenticated: boolean; loginIdentifier?: string }>(`${this.apiBaseUrl}/admin-auth/session`, { withCredentials: true }); }
  logout(): Observable<{ authenticated: boolean }> { return this.http.post<{ authenticated: boolean }>(`${this.apiBaseUrl}/admin-auth/logout`, {}, { withCredentials: true }); }
}
