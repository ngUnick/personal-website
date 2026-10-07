import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminTechnologiesDataAccess } from './admin-technologies.data-access';
import { AdminTechnologyEditorPage } from './admin-technology-editor.page';

describe('AdminTechnologyEditorPage', () => {
  const item = {
    id: '00000000-0000-4000-8000-000000000042',
    name: 'Draft Tool',
    category: 'Tools',
    status: 'draft' as const,
  };

  const providers = (
    platform: string,
    data: unknown,
    auth = of({ authenticated: true }),
    navigateByUrl: (url?: string) => Promise<boolean> = () => Promise.resolve(true),
  ) => [
    { provide: PLATFORM_ID, useValue: platform },
    { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => item.id } } } },
    { provide: Router, useValue: { navigateByUrl } },
    { provide: AdminAuthDataAccess, useValue: { getSession: () => auth } },
    { provide: AdminTechnologiesDataAccess, useValue: data },
  ];

  it('does not submit invalid input and applies the authoritative save response', async () => {
    let calls = 0;
    await TestBed.configureTestingModule({
      imports: [AdminTechnologyEditorPage],
      providers: providers('browser', {
        getTechnology: () => of(item),
        updateContent: () => {
          calls++;
          return of({ ...item, name: 'Canonical Tool' });
        },
      }),
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminTechnologyEditorPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.form.patchValue({ name: '' });
    component.save();
    expect(calls).toBe(0);
    component.form.patchValue({ name: item.name });
    component.save();
    expect(component.form.getRawValue().name).toBe('Canonical Tool');
  });

  it('renders an accessible save error when the update fails', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTechnologyEditorPage],
      providers: providers('browser', {
        getTechnology: () => of(item),
        updateContent: () => throwError(() => new Error('save failed')),
      }),
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminTechnologyEditorPage);
    fixture.detectChanges();
    await fixture.whenStable();
    (fixture.componentInstance as any).save();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Unable to save technology changes.',
    );
  });

  it('keeps the publication action separate and uses the authoritative status response', async () => {
    let contentCalls = 0;
    let statusCalls = 0;
    await TestBed.configureTestingModule({
      imports: [AdminTechnologyEditorPage],
      providers: providers('browser', {
        getTechnology: () => of(item),
        updateContent: () => {
          contentCalls++;
          return of(item);
        },
        updateStatus: (_id: string, status: string) => {
          statusCalls++;
          return of({ ...item, status });
        },
      }),
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminTechnologyEditorPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.changeStatus('published');

    expect({ contentCalls, statusCalls }).toEqual({ contentCalls: 0, statusCalls: 1 });
    expect(component.status()).toBe('published');
  });

  it('renders an accessible status error independently', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTechnologyEditorPage],
      providers: providers('browser', {
        getTechnology: () => of(item),
        updateContent: () => of(item),
        updateStatus: () => throwError(() => new Error('status failed')),
      }),
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminTechnologyEditorPage);
    fixture.detectChanges();
    await fixture.whenStable();
    (fixture.componentInstance as any).changeStatus('published');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Unable to change technology publication status.',
    );
  });

  it('redirects an unauthenticated browser request without reading the technology', async () => {
    const navigation: string[] = [];
    let reads = 0;
    await TestBed.configureTestingModule({
      imports: [AdminTechnologyEditorPage],
      providers: providers(
        'browser',
        {
          getTechnology: () => {
            reads++;
            return of(item);
          },
          updateContent: () => of(item),
        },
        of({ authenticated: false }),
        (url?: string) => {
          navigation.push(url ?? '');
          return Promise.resolve(true);
        },
      ),
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminTechnologyEditorPage);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigation).toEqual(['/admin/login']);
    expect(reads).toBe(0);
  });

  it('makes no private calls during SSR', async () => {
    let sessions = 0;
    let reads = 0;
    let statusUpdates = 0;
    await TestBed.configureTestingModule({
      imports: [AdminTechnologyEditorPage],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => item.id } } } },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
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
            getTechnology: () => {
              reads++;
              return throwError(() => new Error('should not read'));
            },
            updateContent: () => of(item),
            updateStatus: () => {
              statusUpdates++;
              return of(item);
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminTechnologyEditorPage);
    fixture.detectChanges();
    await fixture.whenStable();

    expect({ sessions, reads, statusUpdates }).toEqual({
      sessions: 0,
      reads: 0,
      statusUpdates: 0,
    });
  });
});
