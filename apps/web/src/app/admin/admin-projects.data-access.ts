import { Observable } from 'rxjs';

export type AdminProject = { slug: string; title: string; status: string; featured: boolean };

export abstract class AdminProjectsDataAccess {
  abstract getProjects(): Observable<AdminProject[]>;
  abstract updateFeatured(slug: string, featured: boolean): Observable<AdminProject>;
}
