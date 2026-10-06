import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProjectsDataAccess } from '../projects/projects.data-access';
import { EducationDataAccess } from '../education/education.data-access';
import { HomePage } from './home.page';
import { ProfileDataAccess } from '../profile/profile.data-access';

describe('HomePage', () => {
  it('renders featured projects from its data-access boundary', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        {
          provide: ProjectsDataAccess,
          useValue: {
            getProjects: () => of([]),
            getFeaturedProjects: () =>
              of([
                {
                  slug: 'placeholder-project',
                  title: 'Placeholder Project',
                  summary: 'Temporary sample content used to validate the application path.',
                },
              ]),
            getProject: () =>
              of({
                slug: 'placeholder-project',
                title: 'Placeholder Project',
                summary: 'Temporary sample content used to validate the application path.',
              }),
          },
        },
        { provide: EducationDataAccess, useValue: { getEducation: () => of([{ institution: 'Example Technical Institute', qualification: 'Example Software Engineering Diploma', summary: 'Fictional education fixture used to validate the public homepage path.', startDate: '2020-01-01', endDate: '2023-01-01' }]) } },
        { provide: ProfileDataAccess, useValue: { getProfile: () => of({ headline: 'Example Software Engineer', summary: 'Fictional profile summary used to validate the public home path.', about: 'Fictional profile about text used to validate the public about path.' }) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Featured projects');
    expect(fixture.nativeElement.textContent).toContain('Education');
    expect(fixture.nativeElement.textContent).toContain('Example Software Engineering Diploma');
    expect(fixture.nativeElement.textContent).toContain('Example Technical Institute');
    expect(fixture.nativeElement.textContent).toContain('Example Software Engineer');
    const projectLink = fixture.nativeElement.querySelector(
      'a[href="/projects/placeholder-project"]',
    );
    expect(projectLink?.getAttribute('aria-label')).toBe('View Placeholder Project');
  });
});
