import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminEducationDataAccess } from './admin-education.data-access';
import { AdminEducationPage } from './admin-education.page';

describe('AdminEducationPage', () => {
  it('renders authenticated private entries', async () => {
    let calls = 0;
    await TestBed.configureTestingModule({ imports: [AdminEducationPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminEducationDataAccess, useValue: { getEducations: () => { calls += 1; return of([{ id: 'id', institution: 'Draft Institute', qualification: 'Draft Qualification', status: 'draft' }]); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminEducationPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(calls).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Draft Institute');
    expect(fixture.nativeElement.textContent).toContain('Status: draft');
    expect(fixture.nativeElement.querySelector('[aria-label="Edit Draft Institute"]')).not.toBeNull();
  });

  it('redirects unauthenticated browser users', async () => {
    const navigations: string[] = [];
    await TestBed.configureTestingModule({ imports: [AdminEducationPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: (url: string) => { navigations.push(url); return Promise.resolve(true); } } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: false }) } }, { provide: AdminEducationDataAccess, useValue: { getEducations: () => of([]) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminEducationPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(navigations).toEqual(['/admin/login']);
  });

  it('makes no session or private education requests during SSR', async () => {
    let sessions = 0;
    let dataCalls = 0;
    await TestBed.configureTestingModule({ imports: [AdminEducationPage], providers: [{ provide: PLATFORM_ID, useValue: 'server' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => { sessions += 1; return of({ authenticated: false }); } } }, { provide: AdminEducationDataAccess, useValue: { getEducations: () => { dataCalls += 1; return of([]); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminEducationPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sessions).toBe(0);
    expect(dataCalls).toBe(0);
  });
});
