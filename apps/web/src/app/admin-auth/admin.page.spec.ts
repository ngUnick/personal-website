import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminProjectsDataAccess } from '../admin/admin-projects.data-access';
import { AdminAuthDataAccess } from './admin-auth.data-access';
import { AdminPage } from './admin.page';

describe('AdminPage', () => {
  it('renders the authenticated project toggle with its current state', async () => {
    await TestBed.configureTestingModule({ imports: [AdminPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProjects: () => of([{ slug: 'placeholder-project', title: 'Placeholder Project', status: 'published', featured: true }, { slug: 'draft-placeholder-project', title: 'Draft Placeholder Project', status: 'draft', featured: false }]), updateFeatured: () => of({}) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('[aria-label="Toggle featured for Placeholder Project"]');
    expect(button?.getAttribute('aria-label')).toBe('Toggle featured for Placeholder Project');
    expect(button?.getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.querySelectorAll('article').length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Manage profile');
    expect(fixture.nativeElement.querySelector('[aria-label="Move Placeholder Project up"]')?.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[aria-label="Move Draft Placeholder Project down"]')?.disabled).toBe(true);
  });

  it('replaces the ordered list after a move and renders ordering errors accessibly', async () => {
    let moved: unknown;
    await TestBed.configureTestingModule({ imports: [AdminPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProjects: () => of([{ slug: 'first', title: 'First', status: 'draft', featured: false }, { slug: 'second', title: 'Second', status: 'draft', featured: false }]), moveProject: (slug: string, direction: string) => { moved = { slug, direction }; return of([{ slug: 'second', title: 'Second', status: 'draft', featured: false }, { slug: 'first', title: 'First', status: 'draft', featured: false }]); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any; component.moveProject(component.projects[1], 'up'); fixture.detectChanges();
    expect(moved).toEqual({ slug: 'second', direction: 'up' }); expect(component.projects.map((project: { slug: string }) => project.slug)).toEqual(['second', 'first']);
  });

  it('renders an ordering failure accessibly', async () => {
    await TestBed.configureTestingModule({ imports: [AdminPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProjects: () => of([{ slug: 'first', title: 'First', status: 'draft', featured: false }]), moveProject: () => throwError(() => new Error('order failed')) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any; component.moveProject(component.projects[0], 'down'); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Unable to update project order');
  });

  it('redirects an unauthenticated browser user to the login page', async () => {
    const navigateByUrl = (url: string) => { expect(url).toBe('/admin/login'); return Promise.resolve(true); };
    await TestBed.configureTestingModule({ imports: [AdminPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: false }) } }, { provide: AdminProjectsDataAccess, useValue: {} }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminPage);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('does not check the browser session while rendering on the server', async () => {
    let sessionChecks = 0;
    await TestBed.configureTestingModule({ imports: [AdminPage], providers: [{ provide: PLATFORM_ID, useValue: 'server' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => { sessionChecks += 1; return of({ authenticated: true }); } } }, { provide: AdminProjectsDataAccess, useValue: {} }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sessionChecks).toBe(0);
  });

  it('creates a draft with only the editable creation fields then opens its editor', async () => {
    const navigations: string[] = [];
    let created: unknown;
    await TestBed.configureTestingModule({ imports: [AdminPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: (url: string) => { navigations.push(url); return Promise.resolve(true); } } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProjects: () => of([]), createDraft: (input: unknown) => { created = input; return of({ slug: 'fictional-new-project', title: 'Fictional New Project', summary: 'Fake summary', status: 'draft', featured: false }); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.createForm.setValue({ slug: 'fictional-new-project', title: 'Fictional New Project', summary: 'Fake summary' }); component.createDraft();
    expect(created).toEqual({ slug: 'fictional-new-project', title: 'Fictional New Project', summary: 'Fake summary' });
    expect(navigations).toEqual(['/admin/projects/fictional-new-project/edit']);
  });

  it('does not create an invalid draft and renders creation failures accessibly', async () => {
    let calls = 0;
    await TestBed.configureTestingModule({ imports: [AdminPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: ActivatedRoute, useValue: {} }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProjects: () => of([]), createDraft: () => { calls += 1; return throwError(() => new Error('create failed')); } } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminPage); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any; component.createDraft(); expect(calls).toBe(0);
    component.createForm.setValue({ slug: 'fictional-new-project', title: 'Fictional New Project', summary: 'Fake summary' }); component.createDraft(); fixture.detectChanges();
    expect(calls).toBe(1);
    const alert = fixture.nativeElement.querySelector('[role="alert"]'); expect(alert?.textContent).toContain('Unable to create the project draft');
  });
});
