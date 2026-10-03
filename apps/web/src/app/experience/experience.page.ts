import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExperienceDataAccess } from './experience.data-access';

@Component({
  selector: 'app-experience-page',
  templateUrl: './experience.page.html',
  styleUrl: './experience.page.scss',
})
export class ExperiencePage {
  private readonly experienceDataAccess = inject(ExperienceDataAccess);

  protected readonly experiences = toSignal(this.experienceDataAccess.getExperience(), {
    initialValue: [],
  });
}
