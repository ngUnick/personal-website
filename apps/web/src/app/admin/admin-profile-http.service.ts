import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api-base-url';
import { AdminProfile, AdminProfileDataAccess } from './admin-profile.data-access';

@Injectable({ providedIn: 'root' })
export class AdminProfileHttpService extends AdminProfileDataAccess {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getProfile(): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${this.apiBaseUrl}/admin/profile`, {
      withCredentials: true,
    });
  }

  updateContent(content: AdminProfile): Observable<AdminProfile> {
    return this.http.patch<AdminProfile>(
      `${this.apiBaseUrl}/admin/profile/content`,
      content,
      { withCredentials: true },
    );
  }
}
