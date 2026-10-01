import { InjectionToken, Provider } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const apiBaseUrlProvider: Provider = { provide: API_BASE_URL, useValue: '/api' };
