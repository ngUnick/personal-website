import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProjectsDataAccess } from './projects.data-access';
import { ProjectsPage } from './projects.page';

describe('ProjectsPage', () => {
  it('renders projects from its data-access boundary', async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsPage],
      providers: [
        provideRouter([]),
        {
          provide: ProjectsDataAccess,
          useValue: {
            getProjects: () =>
              of([
                {
                  slug: 'placeholder-project',
                  title: 'Placeholder Project',
                  summary: 'Temporary sample content used to validate the application path.',
                  completedOn: '2025-01-01',
                },
              ]),
            getProject: () =>
              of({
                slug: 'placeholder-project',
                title: 'Placeholder Project',
                summary: 'Temporary sample content used to validate the application path.',
                completedOn: '2025-01-01',
              }),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Placeholder Project');
    expect(fixture.nativeElement.textContent).toContain(
      'Temporary sample content used to validate the application path.',
    );
    expect(fixture.nativeElement.textContent).toContain('Completed 2025-01-01');
    const projectLink = fixture.nativeElement.querySelector(
      'a[href="/projects/placeholder-project"]',
    );
    expect(projectLink?.getAttribute('aria-label')).toBe('View Placeholder Project');
  });

  it('omits completion markup when a project has no completion date', async () => {
    await TestBed.configureTestingModule({ imports: [ProjectsPage], providers: [provideRouter([]), { provide: ProjectsDataAccess, useValue: { getProjects: () => of([{ slug: 'placeholder-project', title: 'Placeholder Project', summary: 'Summary', completedOn: null }]) } }] }).compileComponents();
    const fixture = TestBed.createComponent(ProjectsPage); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('time')).toBeNull();
  });
});
