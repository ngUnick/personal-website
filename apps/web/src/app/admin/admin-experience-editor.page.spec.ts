import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminExperienceDataAccess } from './admin-experience.data-access';
import { AdminTechnologiesDataAccess } from './admin-technologies.data-access';
import { AdminExperienceEditorPage } from './admin-experience-editor.page';

describe('AdminExperienceEditorPage', () => {
  const experience = { id: 'id', organization: 'Draft Studio', role: 'Engineer', summary: 'Fake', location: null, organizationUrl: null, startDate: '2025-01-01', endDate: null, technologyIds: [], status: 'draft' as const };
  const technologies = { getTechnologies: () => of([]) };
  it('maps blank end dates to null and updates the private preview', async () => {
    let saved: unknown;
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminTechnologiesDataAccess, useValue: technologies }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => of(experience), updateContent: (_id: string, value: unknown) => { saved = value; return of({ ...experience, organization: 'Edited Studio' }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any;
    expect(component.form.getRawValue().endDate).toBe(''); component.save(); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges(); expect(saved).toEqual({ organization: 'Draft Studio', role: 'Engineer', summary: 'Fake', startDate: '2025-01-01', endDate: null }); expect(component.experience.organization).toBe('Edited Studio');
  });

  it('loads and saves selected technologies separately from Experience content', async () => {
    let saved: string[] | undefined;
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminTechnologiesDataAccess, useValue: { getTechnologies: () => of([{ id: 'technology-id', name: 'TypeScript', category: 'Language', status: 'published' as const }]) } }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => of(experience), updateTechnologies: (_id: string, ids: string[]) => { saved = ids; return of({ ...experience, technologyIds: ids }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any;
    expect(fixture.nativeElement.textContent).toContain('TypeScript'); component.toggleTechnology('technology-id', true); component.saveTechnologies(); expect(saved).toEqual(['technology-id']);
  });

  it('renders an accessible technologies failure and can clear the selection', async () => {
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminTechnologiesDataAccess, useValue: technologies }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => of({ ...experience, technologyIds: ['technology-id'] }), updateTechnologies: () => throwError(() => new Error('failed')) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any;
    component.toggleTechnology('technology-id', false); expect(component.technologyIds.value).toEqual([]); component.saveTechnologies(); fixture.detectChanges(); expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to save experience technologies');
  });

  it('saves and clears location separately from content', async () => {
    let saved: unknown;
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => of(experience), updateLocation: (_id: string, location: unknown) => { saved = location; return of({ ...experience, location }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any;
    component.locationForm.setValue({ location: ' Remote ' }); component.updateLocation(); expect(saved).toBe('Remote');
    component.locationForm.setValue({ location: ' ' }); component.updateLocation(); expect(saved).toBeNull();
  });

  it('saves and clears the organization URL separately from content', async () => {
    let saved: unknown;
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => of(experience), updateOrganizationUrl: (_id: string, organizationUrl: unknown) => { saved = organizationUrl; return of({ ...experience, organizationUrl }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any;
    component.organizationUrlForm.setValue({ organizationUrl: ' https://example.invalid ' }); component.updateOrganizationUrl(); expect(saved).toBe('https://example.invalid');
    component.organizationUrlForm.setValue({ organizationUrl: ' ' }); component.updateOrganizationUrl(); expect(saved).toBeNull();
  });

  it('renders a distinct accessible organization URL failure', async () => {
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => of(experience), updateOrganizationUrl: () => throwError(() => new Error('organization URL failed')) } } ] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable(); (fixture.componentInstance as any).updateOrganizationUrl(); fixture.detectChanges(); expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to save experience organization URL');
  });

  it('does not save invalid forms and renders failures accessibly', async () => {
    let calls = 0;
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => of(experience), updateContent: () => { calls += 1; return throwError(() => new Error('failed')); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any; component.form.patchValue({ organization: '' }); component.save(); expect(calls).toBe(0); component.form.patchValue({ organization: 'Draft Studio' }); component.save(); fixture.detectChanges(); expect(calls).toBe(1); expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to save experience changes');
  });

  it('makes no session or private data requests during SSR', async () => {
    let sessions = 0; let dataCalls = 0; let technologyCalls = 0; let organizationUrlUpdates = 0;
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'server' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => { sessions += 1; return of({ authenticated: true }); } } }, { provide: AdminTechnologiesDataAccess, useValue: { getTechnologies: () => { technologyCalls += 1; return of([]); } } }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => { dataCalls += 1; return of(experience); }, updateContent: () => of(experience), updateOrganizationUrl: () => { organizationUrlUpdates += 1; return of(experience); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable(); expect(sessions).toBe(0); expect(dataCalls).toBe(0); expect(technologyCalls).toBe(0); expect(organizationUrlUpdates).toBe(0);
  });

  it('updates publication separately and renders a status failure accessibly', async () => {
    let contentCalls = 0; let status: string | undefined;
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => of(experience), updateContent: () => { contentCalls += 1; return of(experience); }, updateStatus: (_id: string, value: string) => { status = value; return of({ ...experience, status: 'published' }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any; expect(component.statusControl.getRawValue()).toBe('draft'); component.statusControl.setValue('published'); component.updateStatus(); fixture.detectChanges(); expect(status).toBe('published'); expect(contentCalls).toBe(0); expect(component.experience.status).toBe('published');
  });

  it('renders a distinct accessible status-update failure', async () => {
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => of(experience), updateContent: () => of(experience), updateStatus: () => throwError(() => new Error('status failed')) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable(); (fixture.componentInstance as any).updateStatus(); fixture.detectChanges(); expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to update publication status');
  });

  it('shows deletion only for Drafts and returns to the Experience list after deletion', async () => {
    const navigations: string[] = []; let deleted: string | undefined;
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: (url: string) => { navigations.push(url); return Promise.resolve(true); } } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => of(experience), deleteDraft: (id: string) => { deleted = id; return of(undefined); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Delete draft'); (fixture.componentInstance as any).deleteDraft();
    expect(deleted).toBe('id'); expect(navigations).toEqual(['/admin/experience']);
  });

  it('hides deletion for non-Drafts and reports deletion failures accessibly', async () => {
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => of({ ...experience, status: 'published' as const }), deleteDraft: () => throwError(() => new Error('delete failed')) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('Delete draft');

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => of(experience), deleteDraft: () => throwError(() => new Error('delete failed')) } }] }).compileComponents();
    const draftFixture = TestBed.createComponent(AdminExperienceEditorPage); draftFixture.detectChanges(); await draftFixture.whenStable(); (draftFixture.componentInstance as any).deleteDraft(); draftFixture.detectChanges();
    expect(draftFixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to delete this draft');
  });
});
