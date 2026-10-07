import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminCredentialsDataAccess } from './admin-credentials.data-access';
import { AdminCredentialEditorPage } from './admin-credential-editor.page';

describe('AdminCredentialEditorPage', () => {
  const item = { id: '00000000-0000-4000-8000-000000000050', name: 'Draft Credential', issuer: 'Example Provider', issuedOn: '2025-01-01', status: 'draft' as const };
  const providers = (platform: string, data: unknown, auth = of({ authenticated: true }), navigateByUrl = () => Promise.resolve(true)) => [
    { provide: PLATFORM_ID, useValue: platform },
    { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => item.id } } } },
    { provide: Router, useValue: { navigateByUrl } },
    { provide: AdminAuthDataAccess, useValue: { getSession: () => auth } },
    { provide: AdminCredentialsDataAccess, useValue: data },
  ];

  it('does not submit invalid input and applies the authoritative save response', async () => {
    let calls = 0;
    await TestBed.configureTestingModule({ imports: [AdminCredentialEditorPage], providers: providers('browser', { getCredential: () => of(item), updateContent: () => { calls++; return of({ ...item, name: 'Canonical Credential' }); } }) }).compileComponents();
    const fixture = TestBed.createComponent(AdminCredentialEditorPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.form.patchValue({ name: '' }); component.save(); expect(calls).toBe(0);
    component.form.patchValue({ name: item.name }); component.save();
    expect(component.form.getRawValue().name).toBe('Canonical Credential');
  });

  it('renders an accessible save error', async () => {
    await TestBed.configureTestingModule({ imports: [AdminCredentialEditorPage], providers: providers('browser', { getCredential: () => of(item), updateContent: () => throwError(() => new Error('save failed')) }) }).compileComponents();
    const fixture = TestBed.createComponent(AdminCredentialEditorPage); fixture.detectChanges(); await fixture.whenStable();
    (fixture.componentInstance as any).save(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to save credential changes.');
  });

  it('keeps publication changes separate and renders an accessible status error', async () => {
    let contentCalls = 0; let statusCalls = 0;
    await TestBed.configureTestingModule({ imports: [AdminCredentialEditorPage], providers: providers('browser', { getCredential: () => of(item), updateContent: () => { contentCalls++; return of(item); }, updateStatus: (_id: string, status: string) => { statusCalls++; return of({ ...item, status }); } }) }).compileComponents();
    const fixture = TestBed.createComponent(AdminCredentialEditorPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.changeStatus('published');
    expect({ contentCalls, statusCalls }).toEqual({ contentCalls: 0, statusCalls: 1 });
    expect(component.status()).toBe('published');

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [AdminCredentialEditorPage], providers: providers('browser', { getCredential: () => of(item), updateContent: () => of(item), updateStatus: () => throwError(() => new Error('status failed')) }) }).compileComponents();
    const failed = TestBed.createComponent(AdminCredentialEditorPage); failed.detectChanges(); await failed.whenStable();
    (failed.componentInstance as any).changeStatus('published'); failed.detectChanges();
    expect(failed.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to change credential publication status.');
  });

  it('redirects an unauthenticated browser without reading the credential', async () => {
    const navigation: string[] = []; let reads = 0;
    await TestBed.configureTestingModule({ imports: [AdminCredentialEditorPage], providers: providers('browser', { getCredential: () => { reads++; return of(item); }, updateContent: () => of(item) }, of({ authenticated: false }), (url?: string) => { navigation.push(url ?? ''); return Promise.resolve(true); }) }).compileComponents();
    const fixture = TestBed.createComponent(AdminCredentialEditorPage); fixture.detectChanges(); await fixture.whenStable();
    expect(navigation).toEqual(['/admin/login']); expect(reads).toBe(0);
  });

  it('makes no private calls during SSR', async () => {
    let sessions = 0; let reads = 0; let statusUpdates = 0;
    await TestBed.configureTestingModule({ imports: [AdminCredentialEditorPage], providers: [
      { provide: PLATFORM_ID, useValue: 'server' },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => item.id } } } },
      { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
      { provide: AdminAuthDataAccess, useValue: { getSession: () => { sessions++; return of({ authenticated: true }); } } },
      { provide: AdminCredentialsDataAccess, useValue: { getCredential: () => { reads++; return of(item); }, updateContent: () => of(item), updateStatus: () => { statusUpdates++; return of(item); } } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(AdminCredentialEditorPage); fixture.detectChanges(); await fixture.whenStable();
    expect({ sessions, reads, statusUpdates }).toEqual({ sessions: 0, reads: 0, statusUpdates: 0 });
  });
});
