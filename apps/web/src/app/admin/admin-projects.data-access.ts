import { Observable } from 'rxjs';

export type AdminProject = { slug: string; title: string; status: string; featured: boolean };
export type AdminProjectDetail = AdminProject & { summary: string };
export type ProjectContentUpdate = { title: string; summary: string };

export abstract class AdminProjectsDataAccess {
  abstract getProjects(): Observable<AdminProject[]>;
  abstract updateFeatured(slug: string, featured: boolean): Observable<AdminProject>;
  abstract getProject(slug: string): Observable<AdminProjectDetail>;
  abstract updateContent(slug: string, content: ProjectContentUpdate): Observable<AdminProjectDetail>;
}
