import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminProfileDataAccess } from './admin-profile.data-access';
import { AdminProfilePage } from './admin-profile.page';

describe('AdminProfilePage', () => {
  const profile = { headline: 'Example headline', summary: 'Example summary', about: 'Example about' };

  it('uses the authoritative saved response and does not submit an invalid form', async () => {
    let calls = 0;
    let saved: unknown;
    await TestBed.configureTestingModule({ imports: [AdminProfilePage], providers: [
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
      { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } },
      { provide: AdminProfileDataAccess, useValue: { getProfile: () => of(profile), updateContent: (value: unknown) => { calls += 1; saved = value; return of({ ...profile, headline: 'Canonical saved headline' }); } } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProfilePage);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.form.patchValue({ headline: '' });
    component.save();
    expect(calls).toBe(0);
    component.form.patchValue({ headline: profile.headline });
    component.save();
    expect(saved).toEqual(profile);
    expect(component.form.getRawValue().headline).toBe('Canonical saved headline');
  });

  it('redirects unauthenticated users', async () => {
    const navigations: string[] = [];
    await TestBed.configureTestingModule({ imports: [AdminProfilePage], providers: [
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: Router, useValue: { navigateByUrl: (url: string) => { navigations.push(url); return Promise.resolve(true); } } },
      { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: false }) } },
      { provide: AdminProfileDataAccess, useValue: { getProfile: () => of(profile), updateContent: () => of(profile) } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProfilePage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(navigations).toEqual(['/admin/login']);
  });

  it('presents save errors accessibly', async () => {
    await TestBed.configureTestingModule({ imports: [AdminProfilePage], providers: [
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
      { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } },
      { provide: AdminProfileDataAccess, useValue: { getProfile: () => of(profile), updateContent: () => throwError(() => new Error('failed')) } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProfilePage);
    fixture.detectChanges();
    await fixture.whenStable();
    (fixture.componentInstance as any).save();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to save profile changes');
  });

  it('makes no session or private Profile calls during SSR', async () => {
    let sessions = 0;
    let reads = 0;
    let writes = 0;
    await TestBed.configureTestingModule({ imports: [AdminProfilePage], providers: [
      { provide: PLATFORM_ID, useValue: 'server' },
      { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
      { provide: AdminAuthDataAccess, useValue: { getSession: () => { sessions += 1; return of({ authenticated: true }); } } },
      { provide: AdminProfileDataAccess, useValue: { getProfile: () => { reads += 1; return of(profile); }, updateContent: () => { writes += 1; return of(profile); } } },
    ] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProfilePage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect({ sessions, reads, writes }).toEqual({ sessions: 0, reads: 0, writes: 0 });
  });
});
