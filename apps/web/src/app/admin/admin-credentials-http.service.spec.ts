import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api-base-url';
import { AdminCredentialsHttpService } from './admin-credentials-http.service';

describe('AdminCredentialsHttpService', () => {
  it('uses exact credentialed private Credential requests', () => {
    TestBed.configureTestingModule({
      providers: [
        AdminCredentialsHttpService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    const service = TestBed.inject(AdminCredentialsHttpService);
    const http = TestBed.inject(HttpTestingController);
    const id = '00000000-0000-4000-8000-000000000050';
    const content = { name: 'Edited Credential', issuer: 'Example Provider', issuedOn: '2025-02-01' };

    service.getCredentials().subscribe();
    const list = http.expectOne('/api/admin/credentials');
    expect(list.request.method).toBe('GET');
    expect(list.request.withCredentials).toBe(true);
    list.flush([]);

    service.createDraft(content).subscribe();
    const create = http.expectOne('/api/admin/credentials');
    expect(create.request.method).toBe('POST');
    expect(create.request.withCredentials).toBe(true);
    expect(create.request.body).toEqual(content);
    create.flush({});

    service.getCredential(id).subscribe();
    const detail = http.expectOne(`/api/admin/credentials/${id}`);
    expect(detail.request.method).toBe('GET');
    expect(detail.request.withCredentials).toBe(true);
    detail.flush({});

    service.updateContent(id, content).subscribe();
    const update = http.expectOne(`/api/admin/credentials/${id}/content`);
    expect(update.request.method).toBe('PATCH');
    expect(update.request.withCredentials).toBe(true);
    expect(update.request.body).toEqual(content);
    update.flush({});
    service.updateStatus(id, 'published').subscribe();
    const status = http.expectOne(`/api/admin/credentials/${id}/status`);
    expect(status.request.method).toBe('PATCH');
    expect(status.request.withCredentials).toBe(true);
    expect(status.request.body).toEqual({ status: 'published' });
    status.flush({});
    http.verify();
  });
});
