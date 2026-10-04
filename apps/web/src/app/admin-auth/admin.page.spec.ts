import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AdminProjectsDataAccess } from '../admin/admin-projects.data-access';
import { AdminAuthDataAccess } from './admin-auth.data-access';
import { AdminPage } from './admin.page';

describe('AdminPage', () => {
  it('renders the authenticated project toggle with its current state', async () => {
    await TestBed.configureTestingModule({ imports: [AdminPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: true }) } }, { provide: AdminProjectsDataAccess, useValue: { getProjects: () => of([{ slug: 'placeholder-project', title: 'Placeholder Project', status: 'published', featured: true }]), updateFeatured: () => of({}) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe('Toggle featured for Placeholder Project');
    expect(button?.getAttribute('aria-pressed')).toBe('true');
  });

  it('redirects an unauthenticated browser user to the login page', async () => {
    const navigateByUrl = (url: string) => { expect(url).toBe('/admin/login'); return Promise.resolve(true); };
    await TestBed.configureTestingModule({ imports: [AdminPage], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }, { provide: Router, useValue: { navigateByUrl } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => of({ authenticated: false }) } }, { provide: AdminProjectsDataAccess, useValue: {} }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminPage);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('does not check the browser session while rendering on the server', async () => {
    let sessionChecks = 0;
    await TestBed.configureTestingModule({ imports: [AdminPage], providers: [{ provide: PLATFORM_ID, useValue: 'server' }, { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } }, { provide: AdminAuthDataAccess, useValue: { getSession: () => { sessionChecks += 1; return of({ authenticated: true }); } } }, { provide: AdminProjectsDataAccess, useValue: {} }] }).compileComponents();
    const fixture = TestBed.createComponent(AdminPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sessionChecks).toBe(0);
  });
});
