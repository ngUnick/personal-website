import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api-base-url';
import { Technology, TechnologyDataAccess } from './technology.data-access';
@Injectable({ providedIn: 'root' })
export class TechnologyHttpService extends TechnologyDataAccess { private readonly http = inject(HttpClient); private readonly apiBaseUrl = inject(API_BASE_URL); getTechnologies(): Observable<Technology[]> { return this.http.get<Technology[]>(`${this.apiBaseUrl}/technologies`); } }
