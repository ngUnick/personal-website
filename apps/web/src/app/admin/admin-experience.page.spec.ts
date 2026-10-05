import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminExperienceDataAccess } from './admin-experience.data-access';
import { AdminExperiencePage } from './admin-experience.page';

describe('AdminExperiencePage', () => {
  it('renders authenticated private entries and remains SSR-neutral', async () => {
    let calls = 0;
    await TestBed.configureTestingModule({ imports: [AdminExperiencePage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperiences: () => { calls += 1; return of([{ id: 'id', organization: 'Draft Studio', role: 'Engineer', status: 'draft' }]); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperiencePage); fixture.detectChanges(); await fixture.whenStable();
    expect(calls).toBe(1); expect(fixture.nativeElement.textContent).toContain('Draft Studio'); expect(fixture.nativeElement.querySelector('[aria-label="Edit Draft Studio"]')).not.toBeNull();
  });

  it('redirects unauthenticated browser users', async () => {
    const navigations: string[] = [];
    await TestBed.configureTestingModule({ imports: [AdminExperiencePage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: (url: string) => { navigations.push(url); return Promise.resolve(true); } } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: false }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperiences: () => of([]) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperiencePage); fixture.detectChanges(); await fixture.whenStable(); expect(navigations).toEqual(['/admin/login']);
  });

  it('makes no SSR requests', async () => {
    let sessions = 0; let dataCalls = 0;
    await TestBed.configureTestingModule({ imports: [AdminExperiencePage], providers: [{ provide: PLATFORM_ID, useValue: 'server' }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => { sessions += 1; return of({ authenticated: false }); } } }, { provide: AdminExperienceDataAccess, useValue: { getExperiences: () => { dataCalls += 1; return of([]); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperiencePage); fixture.detectChanges(); await fixture.whenStable(); expect(sessions).toBe(0); expect(dataCalls).toBe(0);
  });
});
