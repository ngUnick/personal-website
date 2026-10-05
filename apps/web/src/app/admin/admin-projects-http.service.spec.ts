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

  it('uses private credentialed detail and content endpoints', () => {
    TestBed.configureTestingModule({ providers: [AdminProjectsHttpService, provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '/api' }] });
    const service = TestBed.inject(AdminProjectsHttpService);
    const http = TestBed.inject(HttpTestingController);
    service.getProject('draft-placeholder-project').subscribe();
    const detail = http.expectOne('/api/admin/projects/draft-placeholder-project');
    expect(detail.request.method).toBe('GET');
    expect(detail.request.withCredentials).toBe(true);
    detail.flush({ slug: 'draft-placeholder-project', title: 'Draft Placeholder Project', summary: 'Draft summary', status: 'draft', featured: false });
    service.updateContent('draft-placeholder-project', { title: 'Edited Draft', summary: 'Edited summary', caseStudy: 'Edited narrative' }).subscribe();
    const update = http.expectOne('/api/admin/projects/draft-placeholder-project/content');
    expect(update.request.method).toBe('PATCH');
    expect(update.request.withCredentials).toBe(true);
    expect(update.request.body).toEqual({ title: 'Edited Draft', summary: 'Edited summary', caseStudy: 'Edited narrative' });
    update.flush({ slug: 'draft-placeholder-project', title: 'Edited Draft', summary: 'Edited summary', status: 'draft', featured: false });
    service.updateStatus('draft-placeholder-project', 'published').subscribe();
    const status = http.expectOne('/api/admin/projects/draft-placeholder-project/status');
    expect(status.request.method).toBe('PATCH');
    expect(status.request.withCredentials).toBe(true);
    expect(status.request.body).toEqual({ status: 'published' });
    status.flush({ slug: 'draft-placeholder-project', title: 'Edited Draft', summary: 'Edited summary', status: 'published', featured: false });
    service.createDraft({ slug: 'fictional-new-project', title: 'Fictional New Project', summary: 'Fake draft content.' }).subscribe();
    const create = http.expectOne('/api/admin/projects');
    expect(create.request.method).toBe('POST');
    expect(create.request.withCredentials).toBe(true);
    expect(create.request.body).toEqual({ slug: 'fictional-new-project', title: 'Fictional New Project', summary: 'Fake draft content.' });
    create.flush({ slug: 'fictional-new-project', title: 'Fictional New Project', summary: 'Fake draft content.', status: 'draft', featured: false });
    http.verify();
  });
});
