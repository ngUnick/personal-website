import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api-base-url';
import { ProfileHttpService } from './profile-http.service';

describe('ProfileHttpService', () => { it('reads the public Profile endpoint', () => { TestBed.configureTestingModule({ providers: [ProfileHttpService, provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '/api' }] }); const service = TestBed.inject(ProfileHttpService); const http = TestBed.inject(HttpTestingController); service.getProfile().subscribe(); const request = http.expectOne('/api/profile'); expect(request.request.method).toBe('GET'); request.flush({ headline: 'Example Software Engineer', summary: 'Fictional profile summary used to validate the public home path.', about: 'Fictional profile about text used to validate the public about path.' }); http.verify(); }); });
