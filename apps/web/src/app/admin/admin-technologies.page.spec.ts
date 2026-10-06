import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminTechnologiesDataAccess } from './admin-technologies.data-access';
import { AdminTechnologiesPage } from './admin-technologies.page';

describe('AdminTechnologiesPage', () => {
  const technologies = [
    {
      id: '00000000-0000-4000-8000-000000000042',
      name: 'Draft Tool',
      category: 'Tools',
      status: 'draft' as const,
    },
  ];

  it('loads the authenticated ordered list in the browser', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTechnologiesPage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
        { provide: ActivatedRoute, useValue: {} },
        {
          provide: AdminAuthDataAccess,
          useValue: { getSession: () => of({ authenticated: true }) },
        },
        {
          provide: AdminTechnologiesDataAccess,
          useValue: { getTechnologies: () => of(technologies) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminTechnologiesPage);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Draft Tool');
    expect(fixture.nativeElement.textContent).toContain('Status: draft');
  });

  it('redirects an unauthenticated browser request without reading technologies', async () => {
    const navigation: string[] = [];
    let reads = 0;
    await TestBed.configureTestingModule({
      imports: [AdminTechnologiesPage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: Router,
          useValue: {
            navigateByUrl: (url: string) => {
              navigation.push(url);
              return Promise.resolve(true);
            },
          },
        },
        { provide: ActivatedRoute, useValue: {} },
        {
          provide: AdminAuthDataAccess,
          useValue: { getSession: () => of({ authenticated: false }) },
        },
        {
          provide: AdminTechnologiesDataAccess,
          useValue: {
            getTechnologies: () => {
              reads++;
              return of([]);
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminTechnologiesPage);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigation).toEqual(['/admin/login']);
    expect(reads).toBe(0);
  });

  it('makes no private calls during SSR', async () => {
    let sessions = 0;
    let reads = 0;
    await TestBed.configureTestingModule({
      imports: [AdminTechnologiesPage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
        { provide: ActivatedRoute, useValue: {} },
        {
          provide: AdminAuthDataAccess,
          useValue: {
            getSession: () => {
              sessions++;
              return of({ authenticated: true });
            },
          },
        },
        {
          provide: AdminTechnologiesDataAccess,
          useValue: {
            getTechnologies: () => {
              reads++;
              return of([]);
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminTechnologiesPage);
    fixture.detectChanges();
    await fixture.whenStable();

    expect({ sessions, reads }).toEqual({ sessions: 0, reads: 0 });
  });
});
