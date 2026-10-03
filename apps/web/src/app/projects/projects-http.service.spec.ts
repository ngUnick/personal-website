import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api-base-url';
import { ProjectsHttpService } from './projects-http.service';

describe('ProjectsHttpService', () => {
  it('requests projects from the API boundary', () => {
    TestBed.configureTestingModule({
      providers: [
        ProjectsHttpService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    const service = TestBed.inject(ProjectsHttpService);
    const http = TestBed.inject(HttpTestingController);
    service.getProjects().subscribe();
    const request = http.expectOne('/api/projects');
    expect(request.request.method).toBe('GET');
    request.flush([]);
    http.verify();
  });

  it('requests one project from the API boundary', () => {
    TestBed.configureTestingModule({
      providers: [
        ProjectsHttpService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    const service = TestBed.inject(ProjectsHttpService);
    const http = TestBed.inject(HttpTestingController);

    service.getProject('placeholder-project').subscribe();

    const request = http.expectOne('/api/projects/placeholder-project');
    expect(request.request.method).toBe('GET');
    request.flush({
      slug: 'placeholder-project',
      title: 'Placeholder Project',
      summary: 'Temporary sample content used to validate the application path.',
    });
    http.verify();
  });
});
