import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ProjectsDataAccess } from './projects.data-access';

@Component({
  selector: 'app-projects-page',
  imports: [RouterLink],
  templateUrl: './projects.page.html',
  styleUrl: './projects.page.scss',
})
export class ProjectsPage {
  private readonly projectsDataAccess = inject(ProjectsDataAccess);

  protected readonly projects = toSignal(this.projectsDataAccess.getProjects(), {
    initialValue: [],
  });
}
