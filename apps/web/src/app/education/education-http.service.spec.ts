import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api-base-url';
import { EducationHttpService } from './education-http.service';

describe('EducationHttpService', () => {
  it('uses the public education endpoint without credentials', () => {
    TestBed.configureTestingModule({
      providers: [
        EducationHttpService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    const service = TestBed.inject(EducationHttpService);
    const http = TestBed.inject(HttpTestingController);

    service.getEducation().subscribe();

    const request = http.expectOne('/api/education');
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(false);
    request.flush([]);
    http.verify();
  });
});
