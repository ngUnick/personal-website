import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ProjectsDataAccess } from '../projects/projects.data-access';
import { EducationDataAccess } from '../education/education.data-access';
import { ProfileDataAccess } from '../profile/profile.data-access';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly projectsDataAccess = inject(ProjectsDataAccess);
  private readonly educationDataAccess = inject(EducationDataAccess);
  private readonly profileDataAccess = inject(ProfileDataAccess);

  protected readonly featuredProjects = toSignal(this.projectsDataAccess.getFeaturedProjects(), {
    initialValue: [],
  });
  protected readonly education = toSignal(this.educationDataAccess.getEducation(), { initialValue: [] });
  protected readonly profile = toSignal(this.profileDataAccess.getProfile());
}
