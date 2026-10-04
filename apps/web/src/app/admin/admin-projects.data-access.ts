import { Observable } from 'rxjs';

export type ProjectPublicationStatus = 'draft' | 'published' | 'archived';
export type AdminProject = { slug: string; title: string; status: ProjectPublicationStatus; featured: boolean };
export type AdminProjectDetail = AdminProject & { summary: string };
export type ProjectContentUpdate = { title: string; summary: string };
export type CreateProjectDraft = { slug: string; title: string; summary: string };

export abstract class AdminProjectsDataAccess {
  abstract getProjects(): Observable<AdminProject[]>;
  abstract updateFeatured(slug: string, featured: boolean): Observable<AdminProject>;
  abstract getProject(slug: string): Observable<AdminProjectDetail>;
  abstract updateContent(slug: string, content: ProjectContentUpdate): Observable<AdminProjectDetail>;
  abstract updateStatus(slug: string, status: ProjectPublicationStatus): Observable<AdminProjectDetail>;
  abstract createDraft(input: CreateProjectDraft): Observable<AdminProjectDetail>;
}
