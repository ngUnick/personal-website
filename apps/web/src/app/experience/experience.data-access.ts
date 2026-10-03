import { Observable } from 'rxjs';

export interface Experience {
  organization: string;
  role: string;
  summary: string;
  startDate: string;
  endDate: string | null;
}

export abstract class ExperienceDataAccess {
  abstract getExperience(): Observable<Experience[]>;
}
