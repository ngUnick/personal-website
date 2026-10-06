import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api-base-url';
import { AdminEducation, AdminEducationDataAccess, AdminEducationDetail, EducationContentUpdate } from './admin-education.data-access';

@Injectable()
export class AdminEducationHttpService extends AdminEducationDataAccess {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getEducations(): Observable<AdminEducation[]> { return this.http.get<AdminEducation[]>(`${this.apiBaseUrl}/admin/education`, { withCredentials: true }); }
  getEducation(id: string): Observable<AdminEducationDetail> { return this.http.get<AdminEducationDetail>(`${this.apiBaseUrl}/admin/education/${id}`, { withCredentials: true }); }
  updateContent(id: string, content: EducationContentUpdate): Observable<AdminEducationDetail> { return this.http.patch<AdminEducationDetail>(`${this.apiBaseUrl}/admin/education/${id}/content`, content, { withCredentials: true }); }
}
