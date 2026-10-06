import { Observable } from 'rxjs';

export type Education = {
  institution: string;
  qualification: string;
  summary: string;
  startDate: string;
  endDate: string | null;
};

export abstract class EducationDataAccess {
  abstract getEducation(): Observable<Education[]>;
}
