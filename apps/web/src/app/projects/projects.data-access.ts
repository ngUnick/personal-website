import { Observable } from 'rxjs';

export interface Project {
  slug: string;
  title: string;
  summary: string;
  startedOn: string | null;
  completedOn: string | null;
}
export interface ProjectDetail extends Project { caseStudy: string; repositoryUrl: string | null; liveUrl: string | null; technologies: { name: string; category: string }[]; }

export abstract class ProjectsDataAccess {
  abstract getProjects(): Observable<Project[]>;
  abstract getFeaturedProjects(): Observable<Project[]>;
  abstract getProject(slug: string): Observable<ProjectDetail>;
}
