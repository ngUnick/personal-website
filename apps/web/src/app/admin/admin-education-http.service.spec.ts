import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api-base-url';
import { AdminEducationHttpService } from './admin-education-http.service';

describe('AdminEducationHttpService', () => {
  it('uses the private credentialed list, detail, and content endpoints', () => {
    TestBed.configureTestingModule({ providers: [AdminEducationHttpService, provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '/api' }] });
    const service = TestBed.inject(AdminEducationHttpService);
    const http = TestBed.inject(HttpTestingController);
    const id = '00000000-0000-4000-8000-000000000034';
    service.getEducations().subscribe();
    const list = http.expectOne('/api/admin/education');
    expect(list.request.method).toBe('GET');
    expect(list.request.withCredentials).toBe(true);
    list.flush([]);
    service.getEducation(id).subscribe();
    const detail = http.expectOne(`/api/admin/education/${id}`);
    expect(detail.request.method).toBe('GET');
    expect(detail.request.withCredentials).toBe(true);
    detail.flush({});
    const content = { institution: 'Example Institute', qualification: 'Example Qualification', summary: 'Fictional content.', startDate: '2024-01-01', endDate: null };
    service.updateContent(id, content).subscribe();
    const update = http.expectOne(`/api/admin/education/${id}/content`);
    expect(update.request.method).toBe('PATCH');
    expect(update.request.withCredentials).toBe(true);
    expect(update.request.body).toEqual(content);
    update.flush({});
    http.verify();
  });
});
