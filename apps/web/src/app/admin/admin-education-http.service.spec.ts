import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api-base-url';
import { AdminEducationHttpService } from './admin-education-http.service';

describe('AdminEducationHttpService', () => {
  it('uses the private credentialed list, create, detail, content, and status endpoints', () => {
    TestBed.configureTestingModule({
      providers: [
        AdminEducationHttpService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    const service = TestBed.inject(AdminEducationHttpService);
    const http = TestBed.inject(HttpTestingController);
    const id = '00000000-0000-4000-8000-000000000034';
    service.getEducations().subscribe();
    const list = http.expectOne('/api/admin/education');
    expect(list.request.method).toBe('GET');
    expect(list.request.withCredentials).toBe(true);
    list.flush([]);
    const content = {
      institution: 'Example Institute',
      qualification: 'Example Qualification',
      summary: 'Fictional content.',
      startDate: '2024-01-01',
      endDate: null,
    };
    service.createDraft(content).subscribe();
    const create = http.expectOne('/api/admin/education');
    expect(create.request.method).toBe('POST');
    expect(create.request.withCredentials).toBe(true);
    expect(create.request.body).toEqual(content);
    create.flush({});
    service.getEducation(id).subscribe();
    const detail = http.expectOne(`/api/admin/education/${id}`);
    expect(detail.request.method).toBe('GET');
    expect(detail.request.withCredentials).toBe(true);
    detail.flush({});
    service.updateContent(id, content).subscribe();
    const update = http.expectOne(`/api/admin/education/${id}/content`);
    expect(update.request.method).toBe('PATCH');
    expect(update.request.withCredentials).toBe(true);
    expect(update.request.body).toEqual(content);
    update.flush({});
    service.updateStatus(id, 'published').subscribe();
    const status = http.expectOne(`/api/admin/education/${id}/status`);
    expect(status.request.method).toBe('PATCH');
    expect(status.request.withCredentials).toBe(true);
    expect(status.request.body).toEqual({ status: 'published' });
    status.flush({});
    http.verify();
  });
});
