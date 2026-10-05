import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api-base-url';
import { AdminExperience, AdminExperienceDataAccess, AdminExperienceDetail, ExperienceContentUpdate, ExperiencePublicationStatus } from './admin-experience.data-access';

@Injectable()
export class AdminExperienceHttpService extends AdminExperienceDataAccess {
  private readonly http = inject(HttpClient); private readonly apiBaseUrl = inject(API_BASE_URL);
  getExperiences(): Observable<AdminExperience[]> { return this.http.get<AdminExperience[]>(`${this.apiBaseUrl}/admin/experience`, { withCredentials: true }); }
  getExperience(id: string): Observable<AdminExperienceDetail> { return this.http.get<AdminExperienceDetail>(`${this.apiBaseUrl}/admin/experience/${id}`, { withCredentials: true }); }
  updateContent(id: string, content: ExperienceContentUpdate): Observable<AdminExperienceDetail> { return this.http.patch<AdminExperienceDetail>(`${this.apiBaseUrl}/admin/experience/${id}/content`, content, { withCredentials: true }); }
  updateStatus(id: string, status: ExperiencePublicationStatus): Observable<AdminExperienceDetail> { return this.http.patch<AdminExperienceDetail>(`${this.apiBaseUrl}/admin/experience/${id}/status`, { status }, { withCredentials: true }); }
}
