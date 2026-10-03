import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api-base-url';
import { ExperienceHttpService } from './experience-http.service';

describe('ExperienceHttpService', () => {
  it('requests experience from the API boundary', () => {
    TestBed.configureTestingModule({
      providers: [
        ExperienceHttpService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    const service = TestBed.inject(ExperienceHttpService);
    const http = TestBed.inject(HttpTestingController);
    service.getExperience().subscribe();
    const request = http.expectOne('/api/experience');
    expect(request.request.method).toBe('GET');
    request.flush([]);
    http.verify();
  });
});
