import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api-base-url';
import { AdminExperienceHttpService } from './admin-experience-http.service';

describe('AdminExperienceHttpService', () => {
  it('uses the private credentialed list, detail, content, status, and creation endpoints', () => {
    TestBed.configureTestingModule({ providers: [AdminExperienceHttpService, provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '/api' }] });
    const service = TestBed.inject(AdminExperienceHttpService); const http = TestBed.inject(HttpTestingController); const id = '00000000-0000-4000-8000-000000000014';
    service.getExperiences().subscribe(); const list = http.expectOne('/api/admin/experience'); expect(list.request.method).toBe('GET'); expect(list.request.withCredentials).toBe(true); list.flush([]);
    service.getExperience(id).subscribe(); const detail = http.expectOne(`/api/admin/experience/${id}`); expect(detail.request.method).toBe('GET'); expect(detail.request.withCredentials).toBe(true); detail.flush({});
    const content = { organization: 'Example', role: 'Engineer', summary: 'Fake', startDate: '2025-01-01', endDate: null };
    service.updateContent(id, content).subscribe(); const update = http.expectOne(`/api/admin/experience/${id}/content`); expect(update.request.method).toBe('PATCH'); expect(update.request.withCredentials).toBe(true); expect(update.request.body).toEqual(content); update.flush({});
    service.updateStatus(id, 'published').subscribe(); const status = http.expectOne(`/api/admin/experience/${id}/status`); expect(status.request.method).toBe('PATCH'); expect(status.request.withCredentials).toBe(true); expect(status.request.body).toEqual({ status: 'published' }); status.flush({});
    service.createDraft(content).subscribe(); const create = http.expectOne('/api/admin/experience'); expect(create.request.method).toBe('POST'); expect(create.request.withCredentials).toBe(true); expect(create.request.body).toEqual(content); create.flush({}); http.verify();
  });
});
