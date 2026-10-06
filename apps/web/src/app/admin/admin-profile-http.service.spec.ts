import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api-base-url';
import { AdminProfileHttpService } from './admin-profile-http.service';

describe('AdminProfileHttpService', () => {
  it('uses exact credentialed private Profile requests', () => {
    TestBed.configureTestingModule({ providers: [AdminProfileHttpService, provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '/api' }] });
    const service = TestBed.inject(AdminProfileHttpService);
    const http = TestBed.inject(HttpTestingController);
    const content = { headline: 'Example headline', summary: 'Example summary', about: 'Example about' };
    service.getProfile().subscribe();
    const get = http.expectOne('/api/admin/profile');
    expect(get.request.method).toBe('GET');
    expect(get.request.withCredentials).toBe(true);
    get.flush(content);
    service.updateContent(content).subscribe();
    const patch = http.expectOne('/api/admin/profile/content');
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.withCredentials).toBe(true);
    expect(patch.request.body).toEqual(content);
    patch.flush(content);
    http.verify();
  });
});
