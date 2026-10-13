import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProjectDetailPage } from './project-detail.page';
import { ProjectsDataAccess } from './projects.data-access';

describe('ProjectDetailPage', () => {
  it('renders a project from its data-access boundary', async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ slug: 'placeholder-project' })) },
        },
        {
          provide: ProjectsDataAccess,
          useValue: {
            getProjects: () => of([]),
            getProject: () =>
              of({
                slug: 'placeholder-project',
                title: 'Placeholder Project',
                summary: 'Temporary sample content used to validate the application path.',
                startedOn: '2024-01-01',
                completedOn: '2025-01-01',
                caseStudy: 'Fictional plain-text case-study narrative.',
                repositoryUrl: 'https://github.com/example/project',
                liveUrl: 'https://example.test/project',
                technologies: [{ name: 'Example TypeScript', category: 'Languages' }],
              }),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProjectDetailPage);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Placeholder Project');
    expect(fixture.nativeElement.textContent).toContain(
      'Temporary sample content used to validate the application path.',
    );
    expect(fixture.nativeElement.textContent).toContain('Started 2024-01-01');
    expect(fixture.nativeElement.textContent).toContain('Completed 2025-01-01');
    expect(fixture.nativeElement.textContent).toContain('Fictional plain-text case-study narrative.');
    expect(fixture.nativeElement.querySelector('a[href="https://github.com/example/project"]')?.textContent).toContain('Repository');
    expect(fixture.nativeElement.querySelector('a[href="https://example.test/project"]')?.textContent).toContain('Live project');
    expect(fixture.nativeElement.querySelector('[aria-label="Technologies"]')?.textContent).toContain('Example TypeScript — Languages');
  });

  it('omits the project links section when both links are absent', async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailPage],
      providers: [provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ slug: 'placeholder-project' })) } },
        { provide: ProjectsDataAccess, useValue: { getProjects: () => of([]), getProject: () => of({ slug: 'placeholder-project', title: 'Placeholder Project', summary: 'Summary', caseStudy: 'Narrative', repositoryUrl: null, liveUrl: null }) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectDetailPage); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[aria-label="Project links"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('time')).toBeNull();
  });

  it('renders start-only and completion-only Project detail timelines independently', async () => {
    const detail = (startedOn: string | null, completedOn: string | null) => ({ slug: 'placeholder-project', title: 'Placeholder Project', summary: 'Summary', startedOn, completedOn, caseStudy: '', repositoryUrl: null, liveUrl: null, technologies: [] });
    await TestBed.configureTestingModule({ imports: [ProjectDetailPage], providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ slug: 'placeholder-project' })) } }, { provide: ProjectsDataAccess, useValue: { getProjects: () => of([]), getProject: () => of(detail('2024-01-01', null)) } }] }).compileComponents();
    const startFixture = TestBed.createComponent(ProjectDetailPage); startFixture.detectChanges(); await startFixture.whenStable();
    expect(startFixture.nativeElement.textContent).toContain('Started 2024-01-01'); expect(startFixture.nativeElement.textContent).not.toContain('Completed');
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [ProjectDetailPage], providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ slug: 'placeholder-project' })) } }, { provide: ProjectsDataAccess, useValue: { getProjects: () => of([]), getProject: () => of(detail(null, '2025-01-01')) } }] }).compileComponents();
    const completionFixture = TestBed.createComponent(ProjectDetailPage); completionFixture.detectChanges(); await completionFixture.whenStable();
    expect(completionFixture.nativeElement.textContent).toContain('Completed 2025-01-01'); expect(completionFixture.nativeElement.textContent).not.toContain('Started');
  });

  it('renders HTML-like case-study content as text rather than DOM', async () => {
    const caseStudy = '<script data-test="case-study">not executable</script>';
    await TestBed.configureTestingModule({
      imports: [ProjectDetailPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ slug: 'placeholder-project' })) } },
        { provide: ProjectsDataAccess, useValue: { getProjects: () => of([]), getProject: () => of({ slug: 'placeholder-project', title: 'Placeholder Project', summary: 'Summary', caseStudy }) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProjectDetailPage); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(caseStudy);
    expect(fixture.nativeElement.querySelector('[data-test="case-study"]')).toBeNull();
  });
});
