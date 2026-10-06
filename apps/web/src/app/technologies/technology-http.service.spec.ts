import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../core/api-base-url';
import { TechnologyHttpService } from './technology-http.service';
describe('TechnologyHttpService', () => { it('uses the public technologies endpoint without credentials', () => { TestBed.configureTestingModule({ providers: [TechnologyHttpService, provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '/api' }] }); const service = TestBed.inject(TechnologyHttpService); const http = TestBed.inject(HttpTestingController); service.getTechnologies().subscribe(); const request = http.expectOne('/api/technologies'); expect(request.request.method).toBe('GET'); expect(request.request.withCredentials).toBe(false); request.flush([{ name: 'Example TypeScript', category: 'Languages' }]); http.verify(); }); });
