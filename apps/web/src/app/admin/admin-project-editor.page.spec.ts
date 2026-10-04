import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminProjectsDataAccess } from './admin-projects.data-access';
import { AdminProjectEditorPage } from './admin-project-editor.page';

describe('AdminProjectEditorPage', () => {
  it('loads a private draft and renders an accessible editor preview', async () => {
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft Placeholder Project', summary: 'Draft summary', status: 'draft', featured: false }), updateContent: () => of({}) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('input')?.labels?.[0]?.textContent).toContain('Title');
    expect(fixture.nativeElement.querySelector('textarea')?.labels?.[0]?.textContent).toContain('Summary');
    expect(fixture.nativeElement.textContent).toContain('Draft Placeholder Project');
    expect(fixture.nativeElement.querySelector('[aria-label="Private project preview"]')).not.toBeNull();
  });

  it('saves only editable content and refreshes the preview from the response', async () => {
    let saved: unknown;
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Original', status: 'draft', featured: false }), updateContent: (_slug: string, content: unknown) => { saved = content; return of({ slug: 'draft-placeholder-project', title: 'Saved', summary: 'Server value', status: 'draft', featured: false }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const component = fixture.componentInstance as any;
    component.form.setValue({ title: 'Client value', summary: 'Client summary' });
    component.save();
    fixture.detectChanges();
    expect(saved).toEqual({ title: 'Client value', summary: 'Client summary' });
    expect(component.project.summary).toBe('Server value');
  });

  it('skips requests during server rendering', async () => {
    let calls = 0;
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'server' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => { calls += 1; return of({ authenticated: true }); } } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => { calls += 1; return of({}); }, updateContent: () => { calls += 1; return of({}); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(calls).toBe(0);
  });

  it('does not submit an invalid browser form', async () => {
    let updates = 0;
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', status: 'draft', featured: false }), updateContent: () => { updates += 1; return of({}); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.form.setValue({ title: '', summary: '' }); component.save();
    expect(updates).toBe(0);
  });

  it('redirects an unauthenticated browser user and exposes save failures accessibly', async () => {
    const redirects: string[] = [];
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: (url: string) => { redirects.push(url); return Promise.resolve(true); } } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: false }) } }, { provide: AdminProjectsDataAccess, useValue: {} }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable();
    expect(redirects).toEqual(['/admin/login']);
  });

  it('shows an alert when a save fails', async () => {
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', status: 'draft', featured: false }), updateContent: () => throwError(() => new Error('save failed')) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    const component = fixture.componentInstance as any; component.project = { slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', status: 'draft', featured: false }; fixture.detectChanges(); component.form.setValue({ title: 'Draft', summary: 'Summary' }); component.save(); await fixture.whenStable(); fixture.detectChanges();
    expect(component.saveError()).toBe(true);
    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert.textContent).toContain('Unable to save project changes');
  });
});
