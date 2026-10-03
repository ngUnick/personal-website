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
  });
});
