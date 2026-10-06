import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminEducationDataAccess } from './admin-education.data-access';
import { AdminEducationEditorPage } from './admin-education-editor.page';

describe('AdminEducationEditorPage', () => {
  const education = { id: 'id', institution: 'Draft Institute', qualification: 'Draft Qualification', summary: 'Fictional content.', startDate: '2024-01-01', endDate: null, status: 'draft' as const };
  const route = { snapshot: { paramMap: { get: () => 'id' } } };

  it('maps blank end dates to null and updates the private preview', async () => {
    let saved: unknown;
    await TestBed.configureTestingModule({ imports: [AdminEducationEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: route }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminEducationDataAccess, useValue: { getEducation: () => of(education), updateContent: (_id: string, value: unknown) => { saved = value; return of({ ...education, institution: 'Edited Institute' }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminEducationEditorPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as any;
    expect(component.form.getRawValue().endDate).toBe('');
    component.save();
    fixture.detectChanges();
    expect(saved).toEqual({ institution: 'Draft Institute', qualification: 'Draft Qualification', summary: 'Fictional content.', startDate: '2024-01-01', endDate: null });
    expect(component.education.institution).toBe('Edited Institute');
  });

  it('does not save invalid forms and renders failures accessibly', async () => {
    let calls = 0;
    await TestBed.configureTestingModule({ imports: [AdminEducationEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: route }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminEducationDataAccess, useValue: { getEducation: () => of(education), updateContent: () => { calls += 1; return throwError(() => new Error('failed')); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminEducationEditorPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.form.patchValue({ institution: '' });
    component.save();
    expect(calls).toBe(0);
    component.form.patchValue({ institution: 'Draft Institute' });
    component.save();
    fixture.detectChanges();
    expect(calls).toBe(1);
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to save education changes');
  });

  it('redirects unauthenticated browser users', async () => {
    const navigations: string[] = [];
    await TestBed.configureTestingModule({ imports: [AdminEducationEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: route }, { provide: Router, useValue: { navigateByUrl: (url: string) => { navigations.push(url); return Promise.resolve(true); } } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: false }) } }, { provide: AdminEducationDataAccess, useValue: { getEducation: () => of(education), updateContent: () => of(education) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminEducationEditorPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(navigations).toEqual(['/admin/login']);
  });

  it('makes no session or private data requests during SSR', async () => {
    let sessions = 0;
    let dataCalls = 0;
    let updateCalls = 0;
    await TestBed.configureTestingModule({ imports: [AdminEducationEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'server' }, { provide: ActivatedRoute, useValue: route }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => { sessions += 1; return of({ authenticated: true }); } } }, { provide: AdminEducationDataAccess, useValue: { getEducation: () => { dataCalls += 1; return of(education); }, updateContent: () => { updateCalls += 1; return of(education); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminEducationEditorPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sessions).toBe(0);
    expect(dataCalls).toBe(0);
    expect(updateCalls).toBe(0);
  });
});
