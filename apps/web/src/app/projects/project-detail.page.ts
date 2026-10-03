import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { ProjectsDataAccess } from './projects.data-access';

@Component({
  selector: 'app-project-detail-page',
  imports: [RouterLink],
  templateUrl: './project-detail.page.html',
  styleUrl: './project-detail.page.scss',
})
export class ProjectDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsDataAccess = inject(ProjectsDataAccess);

  protected readonly project = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('slug')),
      filter((slug): slug is string => slug !== null),
      switchMap((slug) => this.projectsDataAccess.getProject(slug)),
    ),
    { initialValue: null },
  );
}
