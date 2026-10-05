import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api-base-url';
import { Project, ProjectDetail, ProjectsDataAccess } from './projects.data-access';

@Injectable()
export class ProjectsHttpService extends ProjectsDataAccess {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiBaseUrl}/projects`);
  }

  getFeaturedProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiBaseUrl}/projects?featured=true`);
  }

  getProject(slug: string): Observable<ProjectDetail> {
    return this.http.get<ProjectDetail>(`${this.apiBaseUrl}/projects/${slug}`);
  }
}
