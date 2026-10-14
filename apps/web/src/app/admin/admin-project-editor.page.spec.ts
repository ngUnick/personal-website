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
    component.form.setValue({ title: 'Client value', summary: 'Client summary', caseStudy: 'Client narrative' });
    component.save();
    fixture.detectChanges();
    expect(saved).toEqual({ title: 'Client value', summary: 'Client summary', caseStudy: 'Client narrative' });
    expect(component.project.summary).toBe('Server value');
  });

  it('saves and clears the project role separately from project content', async () => {
    const requests: (string | null)[] = [];
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', role: null, status: 'draft', featured: false }), updateRole: (_slug: string, role: string | null) => { requests.push(role); return of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', role, status: 'draft', featured: false }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.roleForm.setValue({ role: ' Software Engineer ' }); component.saveRole();
    component.roleForm.setValue({ role: '' }); component.saveRole();
    fixture.detectChanges();
    expect(requests).toEqual(['Software Engineer', null]);
    expect(component.project.role).toBeNull();
  });

  it('shows an accessible alert when saving a project role fails', async () => {
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', role: null, status: 'draft', featured: false }), updateRole: () => throwError(() => new Error('role failed')) } }]}).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any; component.roleForm.setValue({ role: 'Software Engineer' }); component.saveRole(); await fixture.whenStable(); fixture.detectChanges();
    expect(component.roleError()).toBe(true);
    expect([...fixture.nativeElement.querySelectorAll('[role="alert"]')].map((alert: Element) => alert.textContent)).toContain('Unable to save project role. Please try again.');
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
    component.form.setValue({ title: '', summary: '', caseStudy: '' }); component.save();
    expect(updates).toBe(0);
  });

  it('submits a valid title and summary with a blank case study', async () => {
    let saved: unknown;
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', caseStudy: '', status: 'draft', featured: false }), updateContent: (_slug: string, content: unknown) => { saved = content; return of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', caseStudy: '', status: 'draft', featured: false }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.form.setValue({ title: 'Draft', summary: 'Summary', caseStudy: '' }); component.save();
    expect(saved).toEqual({ title: 'Draft', summary: 'Summary', caseStudy: '' });
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
    const component = fixture.componentInstance as any; component.project = { slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', caseStudy: '', status: 'draft', featured: false }; fixture.detectChanges(); component.form.setValue({ title: 'Draft', summary: 'Summary', caseStudy: '' }); component.save(); await fixture.whenStable(); fixture.detectChanges();
    expect(component.saveError()).toBe(true);
    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert.textContent).toContain('Unable to save project changes');
  });

  it('updates publication status from the server response', async () => {
    let requestedStatus: string | undefined;
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', status: 'draft', featured: false }), updateStatus: (_slug: string, status: string) => { requestedStatus = status; return of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', status: 'published', featured: false }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    const component = fixture.componentInstance as any; component.statusControl.setValue('published'); component.updateStatus(); fixture.detectChanges();
    expect(requestedStatus).toBe('published');
    expect(component.project.status).toBe('published');
    expect(fixture.nativeElement.textContent).toContain('Status: published');
  });

  it('normalizes blank links and refreshes them from the authoritative response', async () => {
    let saved: unknown;
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', caseStudy: '', repositoryUrl: null, liveUrl: null, status: 'draft', featured: false }), updateLinks: (_slug: string, links: unknown) => { saved = links; return of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', caseStudy: '', repositoryUrl: 'https://github.com/example/project', liveUrl: null, status: 'draft', featured: false }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.linksForm.setValue({ repositoryUrl: ' https://github.com/example/project ', liveUrl: '  ' }); component.saveLinks(); fixture.detectChanges();
    expect(saved).toEqual({ repositoryUrl: 'https://github.com/example/project', liveUrl: null });
    expect(component.project.repositoryUrl).toBe('https://github.com/example/project');
  });

  it('shows an accessible alert when saving project links fails', async () => {
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', caseStudy: '', repositoryUrl: null, liveUrl: null, status: 'draft', featured: false }), updateLinks: () => throwError(() => new Error('links failed')) } }]}).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    const component = fixture.componentInstance as any; component.linksForm.setValue({ repositoryUrl: 'https://example.test', liveUrl: '' }); component.saveLinks(); await fixture.whenStable(); fixture.detectChanges();
    expect(component.linksError()).toBe(true);
    expect([...fixture.nativeElement.querySelectorAll('[role="alert"]')].map((alert: Element) => alert.textContent)).toContain('Unable to save project links. Please try again.');
  });

  it('shows an accessible alert when a publication update fails', async () => {
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', status: 'draft', featured: false }), updateStatus: () => throwError(() => new Error('status failed')) } }]}).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    const component = fixture.componentInstance as any; component.updateStatus(); await fixture.whenStable(); fixture.detectChanges();
    const alerts = [...fixture.nativeElement.querySelectorAll('[role="alert"]')].map((alert: Element) => alert.textContent);
    expect(alerts).toContain('Unable to update publication status. Please try again.');
  });

  it('saves and clears completion dates separately from project content', async () => {
    const requests: (string | null)[] = [];
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', completedOn: null, status: 'draft', featured: false }), updateCompletionDate: (_slug: string, completedOn: string | null) => { requests.push(completedOn); return of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', completedOn, status: 'draft', featured: false }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.completionDateForm.setValue({ completedOn: '2025-01-01' }); component.saveCompletionDate();
    component.completionDateForm.setValue({ completedOn: '' }); component.saveCompletionDate();
    expect(requests).toEqual(['2025-01-01', null]);
    expect(component.project.completedOn).toBeNull();
  });

  it('saves and clears start dates separately from project content', async () => {
    const requests: (string | null)[] = [];
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', startedOn: null, completedOn: null, status: 'draft', featured: false }), updateStartDate: (_slug: string, startedOn: string | null) => { requests.push(startedOn); return of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', startedOn, completedOn: null, status: 'draft', featured: false }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.startDateForm.setValue({ startedOn: '2024-01-01' }); component.saveStartDate();
    component.startDateForm.setValue({ startedOn: '' }); component.saveStartDate();
    expect(requests).toEqual(['2024-01-01', null]);
    expect(component.project.startedOn).toBeNull();
  });

  it('shows an accessible alert when saving a start date fails', async () => {
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', startedOn: null, completedOn: null, status: 'draft', featured: false }), updateStartDate: () => throwError(() => new Error('start date failed')) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any; component.startDateForm.setValue({ startedOn: '2024-01-01' }); component.saveStartDate(); await fixture.whenStable(); fixture.detectChanges();
    expect(component.startDateError()).toBe(true);
    expect([...fixture.nativeElement.querySelectorAll('[role="alert"]')].map((alert: Element) => alert.textContent)).toContain('Unable to save project start date. Please try again.');
  });

  it('shows an accessible alert when saving a completion date fails', async () => {
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', completedOn: null, status: 'draft', featured: false }), updateCompletionDate: () => throwError(() => new Error('completion date failed')) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any; component.completionDateForm.setValue({ completedOn: '2025-01-01' }); component.saveCompletionDate(); await fixture.whenStable(); fixture.detectChanges();
    expect(component.completionDateError()).toBe(true);
    expect([...fixture.nativeElement.querySelectorAll('[role="alert"]')].map((alert: Element) => alert.textContent)).toContain('Unable to save project completion date. Please try again.');
  });

  it('shows draft deletion only for drafts and returns to the project list after deletion', async () => {
    const redirects: string[] = [];
    let deleted: string | undefined;
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: (url: string) => { redirects.push(url); return Promise.resolve(true); } } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', status: 'draft', featured: false }), deleteDraft: (slug: string) => { deleted = slug; return of(undefined); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Delete draft');
    (fixture.componentInstance as any).deleteDraft();
    expect(deleted).toBe('draft-placeholder-project'); expect(redirects).toEqual(['/admin/projects']);
  });

  it('does not show draft deletion for a published project', async () => {
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'published-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'published-project', title: 'Published', summary: 'Summary', status: 'published', featured: false }) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Delete draft"]')).toBeNull();
  });

  it('reports draft deletion failures accessibly', async () => {
    await TestBed.configureTestingModule({ imports: [AdminProjectEditorPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ slug: 'draft-placeholder-project' }) } } }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProject: () => of({ slug: 'draft-placeholder-project', title: 'Draft', summary: 'Summary', status: 'draft', featured: false }), deleteDraft: () => throwError(() => new Error('delete failed')) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminProjectEditorPage); fixture.detectChanges(); await fixture.whenStable(); (fixture.componentInstance as any).deleteDraft(); await fixture.whenStable(); fixture.detectChanges();
    expect((fixture.componentInstance as any).deleteError()).toBe(true);
    expect([...fixture.nativeElement.querySelectorAll('[role="alert"]')].map((alert: Element) => alert.textContent)).toContain('Unable to delete this draft. Please try again.');
  });
});
