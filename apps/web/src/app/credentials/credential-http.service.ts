import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api-base-url';
import { Credential, CredentialDataAccess } from './credential.data-access';

@Injectable()
export class CredentialHttpService extends CredentialDataAccess {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getCredentials(): Observable<Credential[]> {
    return this.http.get<Credential[]>(`${this.apiBaseUrl}/credentials`);
  }
}
