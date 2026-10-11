import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminProfileDataAccess } from './admin-profile.data-access';
import { AdminProfilePage } from './admin-profile.page';

describe('AdminProfilePage', () => {
  const profile = {
    headline: 'Example headline',
    summary: 'Example summary',
    about: 'Example about',
    contactEmail: 'portfolio@example.invalid',
    githubUrl: null,
    linkedinUrl: null,
  };

  it('uses the authoritative saved response and does not submit an invalid form', async () => {
    let calls = 0;
    let saved: unknown;
    await TestBed.configureTestingModule({
      imports: [AdminProfilePage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
        {
          provide: AdminAuthDataAccess,
          useValue: { getSession: () => of({ authenticated: true }) },
        },
        {
          provide: AdminProfileDataAccess,
          useValue: {
            getProfile: () => of(profile),
            updateContent: (value: unknown) => {
              calls += 1;
              saved = value;
              return of({ ...profile, headline: 'Canonical saved headline' });
            },
            updateContact: () => of(profile),
            updateLinks: () => of(profile),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminProfilePage);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.form.patchValue({ headline: '' });
    component.save();
    expect(calls).toBe(0);
    component.form.patchValue({ headline: profile.headline });
    component.save();
    expect(saved).toEqual({
      headline: profile.headline,
      summary: profile.summary,
      about: profile.about,
    });
    expect(component.form.getRawValue().headline).toBe('Canonical saved headline');
  });

  it('redirects unauthenticated users', async () => {
    const navigations: string[] = [];
    await TestBed.configureTestingModule({
      imports: [AdminProfilePage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: Router,
          useValue: {
            navigateByUrl: (url: string) => {
              navigations.push(url);
              return Promise.resolve(true);
            },
          },
        },
        {
          provide: AdminAuthDataAccess,
          useValue: { getSession: () => of({ authenticated: false }) },
        },
        {
          provide: AdminProfileDataAccess,
          useValue: {
            getProfile: () => of(profile),
            updateContent: () => of(profile),
            updateContact: () => of(profile),
            updateLinks: () => of(profile),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminProfilePage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(navigations).toEqual(['/admin/login']);
  });

  it('presents save errors accessibly', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProfilePage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
        {
          provide: AdminAuthDataAccess,
          useValue: { getSession: () => of({ authenticated: true }) },
        },
        {
          provide: AdminProfileDataAccess,
          useValue: {
            getProfile: () => of(profile),
            updateContent: () => throwError(() => new Error('failed')),
            updateContact: () => of(profile),
            updateLinks: () => of(profile),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminProfilePage);
    fixture.detectChanges();
    await fixture.whenStable();
    (fixture.componentInstance as any).save();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Unable to save profile changes',
    );
  });

  it('saves and clears contact email separately with an accessible failure', async () => {
    let contact: string | null | undefined;
    await TestBed.configureTestingModule({
      imports: [AdminProfilePage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
        {
          provide: AdminAuthDataAccess,
          useValue: { getSession: () => of({ authenticated: true }) },
        },
        {
          provide: AdminProfileDataAccess,
          useValue: {
            getProfile: () => of(profile),
            updateContent: () => of(profile),
            updateContact: (value: string | null) => {
              contact = value;
              return of({ ...profile, contactEmail: value });
            },
            updateLinks: () => of(profile),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminProfilePage);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.contactForm.setValue({ contactEmail: 'updated@example.invalid' });
    component.saveContact();
    expect(contact).toBe('updated@example.invalid');
    component.clearContact();
    expect(contact).toBeNull();

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AdminProfilePage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
        {
          provide: AdminAuthDataAccess,
          useValue: { getSession: () => of({ authenticated: true }) },
        },
        {
          provide: AdminProfileDataAccess,
          useValue: {
            getProfile: () => of(profile),
            updateContent: () => of(profile),
            updateContact: () => throwError(() => new Error('failed')),
            updateLinks: () => of(profile),
          },
        },
      ],
    }).compileComponents();
    const failed = TestBed.createComponent(AdminProfilePage);
    failed.detectChanges();
    await failed.whenStable();
    (failed.componentInstance as any).clearContact();
    failed.detectChanges();
    expect(failed.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Unable to save contact email',
    );
  });

  it('saves and clears professional links separately with an accessible failure', async () => {
    let links: unknown;
    await TestBed.configureTestingModule({
      imports: [AdminProfilePage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
        {
          provide: AdminAuthDataAccess,
          useValue: { getSession: () => of({ authenticated: true }) },
        },
        {
          provide: AdminProfileDataAccess,
          useValue: {
            getProfile: () => of(profile),
            updateContent: () => of(profile),
            updateContact: () => of(profile),
            updateLinks: (value: unknown) => {
              links = value;
              return of({ ...profile, ...(value as object) });
            },
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminProfilePage);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.linksForm.setValue({
      githubUrl: ' https://github.com/example ',
      linkedinUrl: 'https://www.linkedin.com/in/example',
    });
    component.saveLinks();
    expect(links).toEqual({
      githubUrl: 'https://github.com/example',
      linkedinUrl: 'https://www.linkedin.com/in/example',
    });
    component.linksForm.setValue({ githubUrl: '', linkedinUrl: '' });
    component.saveLinks();
    expect(links).toEqual({ githubUrl: null, linkedinUrl: null });

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AdminProfilePage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
        {
          provide: AdminAuthDataAccess,
          useValue: { getSession: () => of({ authenticated: true }) },
        },
        {
          provide: AdminProfileDataAccess,
          useValue: {
            getProfile: () => of(profile),
            updateContent: () => of(profile),
            updateContact: () => of(profile),
            updateLinks: () => throwError(() => new Error('failed')),
          },
        },
      ],
    }).compileComponents();
    const failed = TestBed.createComponent(AdminProfilePage);
    failed.detectChanges();
    await failed.whenStable();
    (failed.componentInstance as any).saveLinks();
    failed.detectChanges();
    expect(failed.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Unable to save professional links',
    );
  });

  it('makes no session or private Profile calls during SSR', async () => {
    let sessions = 0;
    let reads = 0;
    let writes = 0;
    let contactWrites = 0;
    let linksWrites = 0;
    await TestBed.configureTestingModule({
      imports: [AdminProfilePage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
        {
          provide: AdminAuthDataAccess,
          useValue: {
            getSession: () => {
              sessions += 1;
              return of({ authenticated: true });
            },
          },
        },
        {
          provide: AdminProfileDataAccess,
          useValue: {
            getProfile: () => {
              reads += 1;
              return of(profile);
            },
            updateContent: () => {
              writes += 1;
              return of(profile);
            },
            updateContact: () => {
              contactWrites += 1;
              return of(profile);
            },
            updateLinks: () => {
              linksWrites += 1;
              return of(profile);
            },
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminProfilePage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect({ sessions, reads, writes, contactWrites, linksWrites }).toEqual({
      sessions: 0,
      reads: 0,
      writes: 0,
      contactWrites: 0,
      linksWrites: 0,
    });
  });
});
