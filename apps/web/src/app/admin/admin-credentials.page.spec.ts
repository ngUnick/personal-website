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

  it('redirects an unauthenticated browser without making private credential requests', async () => {
    const navigation: string[] = []; let reads = 0; let creates = 0; let moves = 0;
    await TestBed.configureTestingModule({ imports: [AdminCredentialsPage], providers: [
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: ActivatedRoute, useValue: {} },
      { provide: Router, useValue: { navigateByUrl: (url: string) => { navigation.push(url); return Promise.resolve(true); } } },
      { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: false }) } },
      { provide: AdminCredentialsDataAccess, useValue: { getCredentials: () => { reads++; return of([]); }, createDraft: () => { creates++; return of({}); }, moveCredential: () => { moves++; return of([]); } } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(AdminCredentialsPage);
    fixture.detectChanges(); await fixture.whenStable();
    expect(navigation).toEqual(['/admin/login']); expect({ reads, creates, moves }).toEqual({ reads: 0, creates: 0, moves: 0 });
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

  it('creates a valid Draft with the server identity and reports creation failures accessibly', async () => {
    let created: unknown;
    const navigation: string[] = [];
    await TestBed.configureTestingModule({
      imports: [AdminCredentialsPage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: { navigateByUrl: (url: string) => { navigation.push(url); return Promise.resolve(true); } } },
        { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } },
        { provide: AdminCredentialsDataAccess, useValue: { getCredentials: () => of([]), createDraft: (input: unknown) => { created = input; return of({ id: 'server-id', name: 'Created', issuer: 'Provider', issuedOn: '2026-01-01', status: 'draft' }); } } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminCredentialsPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.createDraft();
    expect(created).toBeUndefined();
    component.createForm.setValue({ name: 'Created', issuer: 'Provider', issuedOn: '2026-01-01' }); component.createDraft();
    expect(created).toEqual({ name: 'Created', issuer: 'Provider', issuedOn: '2026-01-01' });
    expect(navigation).toEqual(['/admin/credentials/server-id/edit']);

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AdminCredentialsPage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
        { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } },
        { provide: AdminCredentialsDataAccess, useValue: { getCredentials: () => of([]), createDraft: () => throwError(() => new Error('failed')) } },
      ],
    }).compileComponents();
    const failed = TestBed.createComponent(AdminCredentialsPage); failed.detectChanges(); await failed.whenStable();
    (failed.componentInstance as any).createForm.setValue({ name: 'Created', issuer: 'Provider', issuedOn: '2026-01-01' }); (failed.componentInstance as any).createDraft(); failed.detectChanges();
    expect(failed.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to create the credential draft.');
  });

  it('replaces the list from an authoritative ordering response and disables both ordering boundaries', async () => {
    let moved: unknown;
    await TestBed.configureTestingModule({ imports: [AdminCredentialsPage], providers: [
      { provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } },
      { provide: AdminCredentialsDataAccess, useValue: { getCredentials: () => of(credentials), moveCredential: (id: string, direction: string) => { moved = { id, direction }; return of([...credentials].reverse()); } } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(AdminCredentialsPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.moveCredential(credentials[0], 'down');
    expect(moved).toEqual({ id: credentials[0].id, direction: 'down' });
    expect(component.credentials).toEqual([...credentials].reverse());
    expect(fixture.nativeElement.querySelector('button[aria-label="Move Draft Credential up"]')?.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('button[aria-label="Move Draft Credential down"]')?.disabled).toBe(true);
  });

  it('reports ordering failures accessibly', async () => {
    await TestBed.configureTestingModule({ imports: [AdminCredentialsPage], providers: [
      { provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } },
      { provide: AdminCredentialsDataAccess, useValue: { getCredentials: () => of(credentials), moveCredential: () => throwError(() => new Error('failed')) } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(AdminCredentialsPage); fixture.detectChanges(); await fixture.whenStable();
    (fixture.componentInstance as any).moveCredential(credentials[0], 'down'); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to update credential order.');
  });

  it('makes no private calls during SSR', async () => {
    let sessions = 0; let reads = 0; let creates = 0; let moves = 0;
    await TestBed.configureTestingModule({ imports: [AdminCredentialsPage], providers: [
      { provide: PLATFORM_ID, useValue: 'server' },
      { provide: ActivatedRoute, useValue: {} },
      { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
      { provide: AdminAuthDataAccess, useValue: { getSession: () => { sessions++; return of({ authenticated: true }); } } },
      { provide: AdminCredentialsDataAccess, useValue: { getCredentials: () => { reads++; return of([]); }, createDraft: () => { creates++; return of({}); }, moveCredential: () => { moves++; return of([]); } } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(AdminCredentialsPage);
    fixture.detectChanges(); await fixture.whenStable();
    expect({ sessions, reads, creates, moves }).toEqual({ sessions: 0, reads: 0, creates: 0, moves: 0 });
  });
});
