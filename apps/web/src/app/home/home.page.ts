import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ProjectsDataAccess } from '../projects/projects.data-access';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly projectsDataAccess = inject(ProjectsDataAccess);

  protected readonly featuredProjects = toSignal(this.projectsDataAccess.getFeaturedProjects(), {
    initialValue: [],
  });
}
