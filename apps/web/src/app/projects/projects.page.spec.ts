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
                  startedOn: '2024-01-01',
                  completedOn: '2025-01-01',
                },
              ]),
            getProject: () =>
              of({
                slug: 'placeholder-project',
                title: 'Placeholder Project',
                summary: 'Temporary sample content used to validate the application path.',
                startedOn: '2024-01-01',
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
    expect(fixture.nativeElement.textContent).toContain('Started 2024-01-01');
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

  it('renders start-only and completion-only Project timelines independently', async () => {
    await TestBed.configureTestingModule({ imports: [ProjectsPage], providers: [provideRouter([]), { provide: ProjectsDataAccess, useValue: { getProjects: () => of([{ slug: 'started-only', title: 'Started only', summary: 'Summary', startedOn: '2024-01-01', completedOn: null }, { slug: 'completed-only', title: 'Completed only', summary: 'Summary', startedOn: null, completedOn: '2025-01-01' }]) } }] }).compileComponents();
    const fixture = TestBed.createComponent(ProjectsPage); fixture.detectChanges(); await fixture.whenStable();
    const articles = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('article') as ArrayLike<HTMLElement>);
    expect(articles.find((article) => article.textContent?.includes('Started only'))?.textContent).toContain('Started 2024-01-01');
    expect(articles.find((article) => article.textContent?.includes('Started only'))?.textContent).not.toContain('Completed');
    expect(articles.find((article) => article.textContent?.includes('Completed only'))?.textContent).toContain('Completed 2025-01-01');
    expect(articles.find((article) => article.textContent?.includes('Completed only'))?.textContent).not.toContain('Started');
  });
});
