import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminExperienceDataAccess } from './admin-experience.data-access';
import { AdminExperienceEditorPage } from './admin-experience-editor.page';

describe('AdminExperienceEditorPage', () => {
  const experience = { id: 'id', organization: 'Draft Studio', role: 'Engineer', summary: 'Fake', startDate: '2025-01-01', endDate: null, status: 'draft' as const };
  it('maps blank end dates to null and updates the private preview', async () => {
    let saved: unknown;
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => of(experience), updateContent: (_id: string, value: unknown) => { saved = value; return of({ ...experience, organization: 'Edited Studio' }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any;
    expect(component.form.getRawValue().endDate).toBe(''); component.save(); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges(); expect(saved).toEqual({ organization: 'Draft Studio', role: 'Engineer', summary: 'Fake', startDate: '2025-01-01', endDate: null }); expect(component.experience.organization).toBe('Edited Studio');
  });

  it('does not save invalid forms and renders failures accessibly', async () => {
    let calls = 0;
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => of(experience), updateContent: () => { calls += 1; return throwError(() => new Error('failed')); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any; component.form.patchValue({ organization: '' }); component.save(); expect(calls).toBe(0); component.form.patchValue({ organization: 'Draft Studio' }); component.save(); fixture.detectChanges(); expect(calls).toBe(1); expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to save experience changes');
  });

  it('makes no session or private data requests during SSR', async () => {
    let sessions = 0; let dataCalls = 0;
    await TestBed.configureTestingModule({ imports: [AdminExperienceEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'server' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'id' } } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => { sessions += 1; return of({ authenticated: true }); } } }, { provide: AdminExperienceDataAccess, useValue: { getExperience: () => { dataCalls += 1; return of(experience); }, updateContent: () => of(experience) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminExperienceEditorPage); fixture.detectChanges(); await fixture.whenStable(); expect(sessions).toBe(0); expect(dataCalls).toBe(0);
  });
});
