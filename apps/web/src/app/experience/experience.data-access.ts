import { Observable } from 'rxjs';

export interface Experience {
  organization: string;
  role: string;
  summary: string;
  location: string | null;
  organizationUrl: string | null;
  startDate: string;
  endDate: string | null;
  technologies: { name: string; category: string }[];
}

export abstract class ExperienceDataAccess {
  abstract getExperience(): Observable<Experience[]>;
  abstract getFeaturedExperience(): Observable<Experience[]>;
}
