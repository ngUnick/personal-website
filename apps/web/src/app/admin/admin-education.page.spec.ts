import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
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

  it('creates a Draft with a null blank end date and navigates by server ID', async () => {
    let created: unknown;
    const navigations: string[] = [];
    await TestBed.configureTestingModule({ imports: [AdminEducationPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: (url: string) => { navigations.push(url); return Promise.resolve(true); } } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminEducationDataAccess, useValue: { getEducations: () => of([]), createDraft: (input: unknown) => { created = input; return of({ id: 'server-id', institution: 'New Institute', qualification: 'New Qualification', summary: 'Fake', startDate: '2026-01-01', endDate: null, status: 'draft' }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminEducationPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.createDraft();
    expect(created).toBeUndefined();
    component.createForm.setValue({ institution: 'New Institute', qualification: 'New Qualification', summary: 'Fake', startDate: '2026-01-01', endDate: '' });
    component.createDraft();
    expect(created).toEqual({ institution: 'New Institute', qualification: 'New Qualification', summary: 'Fake', startDate: '2026-01-01', endDate: null });
    expect(navigations).toEqual(['/admin/education/server-id/edit']);
  });

  it('renders a distinct error when Draft creation fails', async () => {
    await TestBed.configureTestingModule({ imports: [AdminEducationPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminEducationDataAccess, useValue: { getEducations: () => of([]), createDraft: () => throwError(() => new Error('failed')) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminEducationPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.createForm.setValue({ institution: 'New Institute', qualification: 'New Qualification', summary: 'Fake', startDate: '2026-01-01', endDate: '' });
    component.createDraft();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to create the education draft');
  });

  it('makes no session or private education requests during SSR', async () => {
    let sessions = 0;
    let dataCalls = 0;
    let createCalls = 0;
    await TestBed.configureTestingModule({ imports: [AdminEducationPage], providers: [{ provide: PLATFORM_ID, useValue: 'server' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => { sessions += 1; return of({ authenticated: false }); } } }, { provide: AdminEducationDataAccess, useValue: { getEducations: () => { dataCalls += 1; return of([]); }, createDraft: () => { createCalls += 1; return of({}); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminEducationPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sessions).toBe(0);
    expect(dataCalls).toBe(0);
    expect(createCalls).toBe(0);
  });
});
