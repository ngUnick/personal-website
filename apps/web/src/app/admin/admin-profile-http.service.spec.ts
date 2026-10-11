import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api-base-url';
import { AdminProfileHttpService } from './admin-profile-http.service';

describe('AdminProfileHttpService', () => {
  it('uses exact credentialed private Profile requests', () => {
    TestBed.configureTestingModule({
      providers: [
        AdminProfileHttpService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    const service = TestBed.inject(AdminProfileHttpService);
    const http = TestBed.inject(HttpTestingController);
    const content = {
      headline: 'Example headline',
      summary: 'Example summary',
      about: 'Example about',
    };
    const profile = {
      ...content,
      contactEmail: 'portfolio@example.invalid',
      githubUrl: null,
      linkedinUrl: null,
    };
    service.getProfile().subscribe();
    const get = http.expectOne('/api/admin/profile');
    expect(get.request.method).toBe('GET');
    expect(get.request.withCredentials).toBe(true);
    get.flush(profile);
    service.updateContent(content).subscribe();
    const patch = http.expectOne('/api/admin/profile/content');
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.withCredentials).toBe(true);
    expect(patch.request.body).toEqual(content);
    patch.flush(profile);
    service.updateContact(null).subscribe();
    const contact = http.expectOne('/api/admin/profile/contact');
    expect(contact.request.method).toBe('PATCH');
    expect(contact.request.withCredentials).toBe(true);
    expect(contact.request.body).toEqual({ contactEmail: null });
    contact.flush({ ...profile, contactEmail: null });
    const links = {
      githubUrl: 'https://github.com/example',
      linkedinUrl: 'https://www.linkedin.com/in/example',
    };
    service.updateLinks(links).subscribe();
    const professionalLinks = http.expectOne('/api/admin/profile/links');
    expect(professionalLinks.request.method).toBe('PATCH');
    expect(professionalLinks.request.withCredentials).toBe(true);
    expect(professionalLinks.request.body).toEqual(links);
    professionalLinks.flush({ ...profile, ...links });
    http.verify();
  });
});
