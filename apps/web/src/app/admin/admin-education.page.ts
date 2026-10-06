import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminEducation, AdminEducationDataAccess } from './admin-education.data-access';

@Component({
  selector: 'app-admin-education-page',
  imports: [RouterLink],
  template: `<main><h1>Admin education</h1>@for (education of educations; track education.id) { <article><h2>{{ education.institution }}</h2><p>{{ education.qualification }}</p><p>Status: {{ education.status }}</p><a [routerLink]="['/admin/education', education.id, 'edit']" [attr.aria-label]="'Edit ' + education.institution">Edit</a></article> }</main>`,
})
export class AdminEducationPage {
  private readonly auth = inject(AdminAuthDataAccess);
  private readonly educationData = inject(AdminEducationDataAccess);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  protected educations: AdminEducation[] = [];

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.auth.getSession().subscribe({
      next: (session) =>
        session.authenticated
          ? this.educationData.getEducations().subscribe((educations) => (this.educations = educations))
          : this.router.navigateByUrl('/admin/login'),
      error: () => this.router.navigateByUrl('/admin/login'),
    });
  }
}
