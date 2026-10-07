import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminCredentialsDataAccess } from './admin-credentials.data-access';
import { AdminCredentialsPage } from './admin-credentials.page';

describe('AdminCredentialsPage', () => {
  const credentials = [{ id: '00000000-0000-4000-8000-000000000050', name: 'Draft Credential', issuer: 'Example Provider', status: 'draft' as const }];

  it('renders an authenticated browser list', async () => {
    await TestBed.configureTestingModule({ imports: [AdminCredentialsPage], providers: [
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: ActivatedRoute, useValue: {} },
      { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
      { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } },
      { provide: AdminCredentialsDataAccess, useValue: { getCredentials: () => of(credentials) } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(AdminCredentialsPage);
    fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Draft Credential');
    expect(fixture.nativeElement.textContent).toContain('Status: draft');
  });

  it('redirects an unauthenticated browser without reading credentials', async () => {
    const navigation: string[] = []; let reads = 0;
    await TestBed.configureTestingModule({ imports: [AdminCredentialsPage], providers: [
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: ActivatedRoute, useValue: {} },
      { provide: Router, useValue: { navigateByUrl: (url: string) => { navigation.push(url); return Promise.resolve(true); } } },
      { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: false }) } },
      { provide: AdminCredentialsDataAccess, useValue: { getCredentials: () => { reads++; return of([]); } } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(AdminCredentialsPage);
    fixture.detectChanges(); await fixture.whenStable();
    expect(navigation).toEqual(['/admin/login']); expect(reads).toBe(0);
  });

  it('renders an accessible list-load error', async () => {
    await TestBed.configureTestingModule({ imports: [AdminCredentialsPage], providers: [
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: ActivatedRoute, useValue: {} },
      { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
      { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } },
      { provide: AdminCredentialsDataAccess, useValue: { getCredentials: () => throwError(() => new Error('load failed')) } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(AdminCredentialsPage);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to load credentials.');
  });

  it('makes no private calls during SSR', async () => {
    let sessions = 0; let reads = 0;
    await TestBed.configureTestingModule({ imports: [AdminCredentialsPage], providers: [
      { provide: PLATFORM_ID, useValue: 'server' },
      { provide: ActivatedRoute, useValue: {} },
      { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
      { provide: AdminAuthDataAccess, useValue: { getSession: () => { sessions++; return of({ authenticated: true }); } } },
      { provide: AdminCredentialsDataAccess, useValue: { getCredentials: () => { reads++; return of([]); } } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(AdminCredentialsPage);
    fixture.detectChanges(); await fixture.whenStable();
    expect({ sessions, reads }).toEqual({ sessions: 0, reads: 0 });
  });
});
