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
