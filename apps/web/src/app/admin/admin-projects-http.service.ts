import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api-base-url';
import { AdminProject, AdminProjectDetail, AdminProjectsDataAccess, CreateProjectDraft, ProjectContentUpdate, ProjectPublicationStatus } from './admin-projects.data-access';

@Injectable()
export class AdminProjectsHttpService extends AdminProjectsDataAccess {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  getProjects(): Observable<AdminProject[]> { return this.http.get<AdminProject[]>(`${this.apiBaseUrl}/admin/projects`, { withCredentials: true }); }
  updateFeatured(slug: string, featured: boolean): Observable<AdminProject> { return this.http.patch<AdminProject>(`${this.apiBaseUrl}/admin/projects/${slug}/featured`, { featured }, { withCredentials: true }); }
  getProject(slug: string): Observable<AdminProjectDetail> { return this.http.get<AdminProjectDetail>(`${this.apiBaseUrl}/admin/projects/${slug}`, { withCredentials: true }); }
  updateContent(slug: string, content: ProjectContentUpdate): Observable<AdminProjectDetail> { return this.http.patch<AdminProjectDetail>(`${this.apiBaseUrl}/admin/projects/${slug}/content`, content, { withCredentials: true }); }
  updateStatus(slug: string, status: ProjectPublicationStatus): Observable<AdminProjectDetail> { return this.http.patch<AdminProjectDetail>(`${this.apiBaseUrl}/admin/projects/${slug}/status`, { status }, { withCredentials: true }); }
  createDraft(input: CreateProjectDraft): Observable<AdminProjectDetail> { return this.http.post<AdminProjectDetail>(`${this.apiBaseUrl}/admin/projects`, input, { withCredentials: true }); }
}
