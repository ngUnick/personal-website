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
                caseStudy: 'Fictional plain-text case-study narrative.',
                repositoryUrl: 'https://github.com/example/project',
                liveUrl: 'https://example.test/project',
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
    expect(fixture.nativeElement.textContent).toContain('Fictional plain-text case-study narrative.');
    expect(fixture.nativeElement.querySelector('a[href="https://github.com/example/project"]')?.textContent).toContain('Repository');
    expect(fixture.nativeElement.querySelector('a[href="https://example.test/project"]')?.textContent).toContain('Live project');
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
