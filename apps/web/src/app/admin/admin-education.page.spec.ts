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

  it('uses the authoritative result for adjacent ordering and exposes boundary controls', async () => {
    let moved: unknown;
    const entries = [{ id: 'first', institution: 'First Institute', qualification: 'First', status: 'published' as const }, { id: 'second', institution: 'Second Institute', qualification: 'Second', status: 'draft' as const }];
    await TestBed.configureTestingModule({ imports: [AdminEducationPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminEducationDataAccess, useValue: { getEducations: () => of(entries), moveEducation: (id: string, direction: string) => { moved = { id, direction }; return of([entries[1], entries[0]]); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminEducationPage); fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any;
    expect(fixture.nativeElement.querySelector('[aria-label="Move First Institute up"]')?.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[aria-label="Move Second Institute down"]')?.disabled).toBe(true);
    component.moveEducation(component.educations[1], 'up'); fixture.detectChanges();
    expect(moved).toEqual({ id: 'second', direction: 'up' }); expect(component.educations.map((education: { id: string }) => education.id)).toEqual(['second', 'first']);
  });

  it('renders a distinct error when ordering fails', async () => {
    await TestBed.configureTestingModule({ imports: [AdminEducationPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminEducationDataAccess, useValue: { getEducations: () => of([{ id: 'id', institution: 'Draft Institute', qualification: 'Draft', status: 'draft' }]), moveEducation: () => throwError(() => new Error('failed')) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminEducationPage); fixture.detectChanges(); await fixture.whenStable(); (fixture.componentInstance as any).moveEducation((fixture.componentInstance as any).educations[0], 'down'); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to update education order');
  });

  it('makes no session or private education requests during SSR', async () => {
    let sessions = 0;
    let dataCalls = 0;
    let createCalls = 0;
    let orderCalls = 0;
    await TestBed.configureTestingModule({ imports: [AdminEducationPage], providers: [{ provide: PLATFORM_ID, useValue: 'server' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => { sessions += 1; return of({ authenticated: false }); } } }, { provide: AdminEducationDataAccess, useValue: { getEducations: () => { dataCalls += 1; return of([]); }, createDraft: () => { createCalls += 1; return of({}); }, moveEducation: () => { orderCalls += 1; return of([]); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminEducationPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sessions).toBe(0);
    expect(dataCalls).toBe(0);
    expect(createCalls).toBe(0);
    expect(orderCalls).toBe(0);
  });
});
