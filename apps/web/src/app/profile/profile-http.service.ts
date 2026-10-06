import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api-base-url';
import { Profile, ProfileDataAccess } from './profile.data-access';
@Injectable()
export class ProfileHttpService extends ProfileDataAccess { private readonly http = inject(HttpClient); private readonly apiBaseUrl = inject(API_BASE_URL); getProfile(): Observable<Profile> { return this.http.get<Profile>(`${this.apiBaseUrl}/profile`); } }
