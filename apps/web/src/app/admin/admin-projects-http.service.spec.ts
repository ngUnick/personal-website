import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api-base-url';
import { AdminProjectsHttpService } from './admin-projects-http.service';

describe('AdminProjectsHttpService', () => {
  it('uses the private API boundary with browser credentials', () => {
    TestBed.configureTestingModule({ providers: [AdminProjectsHttpService, provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '/api' }] });
    const service = TestBed.inject(AdminProjectsHttpService);
    const http = TestBed.inject(HttpTestingController);
    service.updateFeatured('placeholder-project', false).subscribe();
    const request = http.expectOne('/api/admin/projects/placeholder-project/featured');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({ featured: false });
    request.flush({ slug: 'placeholder-project', title: 'Placeholder Project', status: 'published', featured: false });
    http.verify();
  });
});
