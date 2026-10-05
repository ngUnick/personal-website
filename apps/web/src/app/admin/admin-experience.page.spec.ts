import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
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

  it('creates a draft with a null blank end date and navigates by server ID', async () => {
    let created: unknown; const navigations: string[] = [];
    await TestBed.configureTestingModule({ imports: [AdminExperiencePage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: (url: string) => { navigations.push(url); return Promise.resolve(true); } } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperiences: () => of([]), createDraft: (input: unknown) => { created = input; return of({ id: 'server-id', organization: 'New Studio', role: 'Engineer', summary: 'Fake', startDate: '2026-01-01', endDate: null, status: 'draft' }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperiencePage); fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any; component.createDraft(); expect(created).toBeUndefined(); component.createForm.setValue({ organization: 'New Studio', role: 'Engineer', summary: 'Fake', startDate: '2026-01-01', endDate: '' }); component.createDraft(); expect(created).toEqual({ organization: 'New Studio', role: 'Engineer', summary: 'Fake', startDate: '2026-01-01', endDate: null }); expect(navigations).toEqual(['/admin/experience/server-id/edit']);
  });

  it('renders a distinct error when draft creation fails', async () => {
    await TestBed.configureTestingModule({ imports: [AdminExperiencePage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperiences: () => of([]), createDraft: () => throwError(() => new Error('failed')) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperiencePage); fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any;
    component.createForm.setValue({ organization: 'New Studio', role: 'Engineer', summary: 'Fake', startDate: '2026-01-01', endDate: '' }); component.createDraft(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to create the experience draft');
  });

  it('uses the authoritative response when moving an experience', async () => {
    let moved: unknown;
    await TestBed.configureTestingModule({ imports: [AdminExperiencePage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperiences: () => of([{ id: 'first', organization: 'First', role: 'Engineer', status: 'published' }, { id: 'second', organization: 'Second', role: 'Engineer', status: 'draft' }]), moveExperience: (id: string, direction: string) => { moved = { id, direction }; return of([{ id: 'second', organization: 'Second', role: 'Engineer', status: 'draft' }, { id: 'first', organization: 'First', role: 'Engineer', status: 'published' }]); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperiencePage); fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any;
    expect(fixture.nativeElement.querySelector('[aria-label="Move First up"]')?.disabled).toBe(true); expect(fixture.nativeElement.querySelector('[aria-label="Move Second down"]')?.disabled).toBe(true); component.moveExperience(component.experiences[1], 'up'); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(moved).toEqual({ id: 'second', direction: 'up' }); expect(component.experiences.map((experience: { id: string }) => experience.id)).toEqual(['second', 'first']);
  });

  it('renders a distinct error when ordering fails', async () => {
    await TestBed.configureTestingModule({ imports: [AdminExperiencePage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperiences: () => of([{ id: 'id', organization: 'Draft Studio', role: 'Engineer', status: 'draft' }]), moveExperience: () => throwError(() => new Error('failed')) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperiencePage); fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any; component.moveExperience(component.experiences[0], 'down'); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to update experience order');
  });

  it('makes no SSR requests', async () => {
    let sessions = 0; let dataCalls = 0; let createCalls = 0; let moveCalls = 0;
    await TestBed.configureTestingModule({ imports: [AdminExperiencePage], providers: [{ provide: PLATFORM_ID, useValue: 'server' }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => { sessions += 1; return of({ authenticated: false }); } } }, { provide: AdminExperienceDataAccess, useValue: { getExperiences: () => { dataCalls += 1; return of([]); }, createDraft: () => { createCalls += 1; return of({}); }, moveExperience: () => { moveCalls += 1; return of([]); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperiencePage); fixture.detectChanges(); await fixture.whenStable(); expect(sessions).toBe(0); expect(dataCalls).toBe(0); expect(createCalls).toBe(0); expect(moveCalls).toBe(0);
  });
});
