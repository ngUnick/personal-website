import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProjectsDataAccess } from '../projects/projects.data-access';
import { EducationDataAccess } from '../education/education.data-access';
import { ExperienceDataAccess } from '../experience/experience.data-access';
import { HomePage } from './home.page';
import { ProfileDataAccess } from '../profile/profile.data-access';
import { TechnologyDataAccess } from '../technologies/technology.data-access';

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
        {
          provide: EducationDataAccess,
          useValue: {
            getEducation: () =>
              of([
                {
                  institution: 'Example Technical Institute',
                  qualification: 'Example Software Engineering Diploma',
                  summary: 'Fictional education fixture used to validate the public homepage path.',
                  startDate: '2020-01-01',
                  endDate: '2023-01-01',
                },
              ]),
          },
        },
        {
          provide: ExperienceDataAccess,
          useValue: {
            getExperience: () =>
              of([
                {
                  organization: 'Example Engineering Studio',
                  role: 'Example Software Engineer',
                  summary:
                    'Fictional experience fixture used to validate the public homepage path.',
                  startDate: '2023-01-01',
                  endDate: null,
                },
              ]),
          },
        },
        {
          provide: ProfileDataAccess,
          useValue: {
            getProfile: () =>
              of({
                headline: 'Example Software Engineer',
                summary: 'Fictional profile summary used to validate the public home path.',
                about: 'Fictional profile about text used to validate the public about path.',
                contactEmail: 'portfolio@example.invalid',
              }),
          },
        },
        {
          provide: TechnologyDataAccess,
          useValue: {
            getTechnologies: () => of([{ name: 'Example TypeScript', category: 'Languages' }]),
          },
        },
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
    expect(fixture.nativeElement.textContent).toContain(
      'Fictional profile about text used to validate the public about path.',
    );
    expect(fixture.nativeElement.querySelector('a[href="/about"]')?.textContent).toContain(
      'Read more about me',
    );
    expect(fixture.nativeElement.textContent).toContain('Technical Toolkit');
    expect(fixture.nativeElement.textContent).toContain('Example TypeScript');
    expect(fixture.nativeElement.textContent).toContain('Experience');
    expect(fixture.nativeElement.textContent).toContain('Example Software Engineer');
    expect(fixture.nativeElement.textContent).toContain('Example Engineering Studio');
    expect(
      Array.from<HTMLElement>(
        fixture.nativeElement.querySelectorAll('a[href="/experience"]') as ArrayLike<HTMLElement>,
      ).map((link) => link.textContent),
    ).toContain('View all experience');
    expect(
      fixture.nativeElement.querySelector('a[href="mailto:portfolio@example.invalid"]')
        ?.textContent,
    ).toContain('portfolio@example.invalid');
    const projectLink = fixture.nativeElement.querySelector(
      'a[href="/projects/placeholder-project"]',
    );
    expect(projectLink?.getAttribute('aria-label')).toBe('View Placeholder Project');
  });

  it('omits Contact when the public Profile has no email', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        {
          provide: ProjectsDataAccess,
          useValue: { getProjects: () => of([]), getFeaturedProjects: () => of([]) },
        },
        { provide: EducationDataAccess, useValue: { getEducation: () => of([]) } },
        { provide: ExperienceDataAccess, useValue: { getExperience: () => of([]) } },
        { provide: TechnologyDataAccess, useValue: { getTechnologies: () => of([]) } },
        {
          provide: ProfileDataAccess,
          useValue: {
            getProfile: () =>
              of({ headline: 'Example', summary: 'Summary', about: 'About', contactEmail: null }),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('a[href^="mailto:"]')).toBeNull();
    const experienceSection = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('section') as ArrayLike<HTMLElement>,
    ).find((section) => section.querySelector('#experience-heading') !== null);
    expect(experienceSection).toBeDefined();
    expect(experienceSection?.querySelectorAll('article')).toHaveLength(0);
  });
});
