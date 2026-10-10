import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api-base-url';
import { CredentialHttpService } from './credential-http.service';

describe('CredentialHttpService', () => {
  it('uses the public credentials endpoint without credentials', () => {
    TestBed.configureTestingModule({
      providers: [
        CredentialHttpService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    const service = TestBed.inject(CredentialHttpService);
    const http = TestBed.inject(HttpTestingController);

    service.getCredentials().subscribe();

    const request = http.expectOne('/api/credentials');
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(false);
    request.flush([]);
    http.verify();
  });
});
