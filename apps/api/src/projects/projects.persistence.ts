export type PersistedProject = {
  slug: string;
  title: string;
  summary: string;
  startedOn: string | null;
  completedOn: string | null;
};
export type ProjectTechnology = { name: string; category: string };
export type PersistedProjectDetail = PersistedProject & { role: string | null; caseStudy: string; repositoryUrl: string | null; liveUrl: string | null };
export type PublicPersistedProjectDetail = PersistedProjectDetail & { technologies: ProjectTechnology[] };
export type AdminPersistedProject = Omit<PersistedProjectDetail, 'role'> & {
  role?: string | null;
  status: ProjectPublicationStatus;
  featured: boolean;
  displayOrder: number;
  technologyIds?: string[];
};
export type ProjectPublicationStatus = 'draft' | 'published' | 'archived';
export type ProjectContentUpdate = Pick<PersistedProjectDetail, 'title' | 'summary' | 'caseStudy'>;
export type ProjectLinksUpdate = Pick<PersistedProjectDetail, 'repositoryUrl' | 'liveUrl'>;
export type ProjectCompletionDateUpdate = Pick<PersistedProject, 'completedOn'>;
export type ProjectStartDateUpdate = Pick<PersistedProject, 'startedOn'>;
export type ProjectRoleUpdate = Pick<PersistedProjectDetail, 'role'>;
export type ProjectTechnologyUpdate = { technologyIds: string[] };
export type CreateProjectDraft = Pick<PersistedProject, 'slug' | 'title' | 'summary'>;
export type ProjectOrderDirection = 'up' | 'down';

export interface ProjectsPersistence {
  findPublished(): Promise<PersistedProject[]>;
  findFeaturedPublished(): Promise<PersistedProject[]>;
  findPublishedBySlug(slug: string): Promise<PublicPersistedProjectDetail | undefined>;
  findForAdmin(): Promise<AdminPersistedProject[]>;
  findForAdminBySlug(slug: string): Promise<AdminPersistedProject | undefined>;
  updateFeatured(slug: string, featured: boolean): Promise<AdminPersistedProject | undefined>;
  updateContent(slug: string, content: ProjectContentUpdate): Promise<AdminPersistedProject | undefined>;
  updateLinks(slug: string, links: ProjectLinksUpdate): Promise<AdminPersistedProject | undefined>;
  updateCompletionDate(slug: string, completedOn: string | null): Promise<AdminPersistedProject | undefined>;
  updateStartDate(slug: string, startedOn: string | null): Promise<AdminPersistedProject | undefined>;
  updateRole(slug: string, role: string | null): Promise<AdminPersistedProject | undefined>;
  updateTechnologies(slug: string, input: ProjectTechnologyUpdate): Promise<AdminPersistedProject | undefined>;
  updateStatus(slug: string, status: ProjectPublicationStatus): Promise<AdminPersistedProject | undefined>;
  moveProject(slug: string, direction: ProjectOrderDirection): Promise<AdminPersistedProject[] | undefined>;
  createDraft(input: CreateProjectDraft): Promise<AdminPersistedProject | undefined>;
}

export const PROJECTS_PERSISTENCE = Symbol('PROJECTS_PERSISTENCE');
