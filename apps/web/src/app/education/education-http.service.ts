import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api-base-url';
import { Education, EducationDataAccess } from './education.data-access';

@Injectable()
export class EducationHttpService extends EducationDataAccess {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getEducation(): Observable<Education[]> {
    return this.http.get<Education[]>(`${this.apiBaseUrl}/education`);
  }
}
