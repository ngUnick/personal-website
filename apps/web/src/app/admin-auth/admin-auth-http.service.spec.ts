import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api-base-url';
import { AdminAuthHttpService } from './admin-auth-http.service';

describe('AdminAuthHttpService', () => {
  it('posts credentials through the authentication API boundary', () => {
    TestBed.configureTestingModule({
      providers: [
        AdminAuthHttpService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    const service = TestBed.inject(AdminAuthHttpService);
    const http = TestBed.inject(HttpTestingController);
    service.login('fake-admin', 'development-only-password').subscribe();
    const request = http.expectOne('/api/admin-auth/login');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({
      loginIdentifier: 'fake-admin',
      password: 'development-only-password',
    });
    request.flush({ authenticated: true });
    http.verify();
  });
});
