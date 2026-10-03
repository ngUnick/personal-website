import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api-base-url';
import { Experience, ExperienceDataAccess } from './experience.data-access';

@Injectable()
export class ExperienceHttpService extends ExperienceDataAccess {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getExperience(): Observable<Experience[]> {
    return this.http.get<Experience[]>(`${this.apiBaseUrl}/experience`);
  }
}
