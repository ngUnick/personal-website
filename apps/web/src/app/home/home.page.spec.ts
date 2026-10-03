import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProjectsDataAccess } from '../projects/projects.data-access';
import { HomePage } from './home.page';

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
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Featured projects');
    const projectLink = fixture.nativeElement.querySelector(
      'a[href="/projects/placeholder-project"]',
    );
    expect(projectLink?.getAttribute('aria-label')).toBe('View Placeholder Project');
  });
});
