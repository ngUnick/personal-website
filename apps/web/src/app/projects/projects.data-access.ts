import { Observable } from 'rxjs';

export interface Project {
  slug: string;
  title: string;
  summary: string;
}

export abstract class ProjectsDataAccess {
  abstract getProjects(): Observable<Project[]>;
  abstract getFeaturedProjects(): Observable<Project[]>;
  abstract getProject(slug: string): Observable<Project>;
}
