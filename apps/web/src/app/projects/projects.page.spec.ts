import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProjectsDataAccess } from './projects.data-access';
import { ProjectsPage } from './projects.page';

describe('ProjectsPage', () => {
  it('renders projects from its data-access boundary', async () => {
    await TestBed.configureTestingModule({ imports: [ProjectsPage], providers: [{ provide: ProjectsDataAccess, useValue: { getProjects: () => of([{ slug: 'placeholder-project', title: 'Placeholder Project', summary: 'Temporary sample content used to validate the application path.' }]) } }] }).compileComponents();
    const fixture = TestBed.createComponent(ProjectsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Placeholder Project');
    expect(fixture.nativeElement.textContent).toContain('Temporary sample content used to validate the application path.');
  });
});
