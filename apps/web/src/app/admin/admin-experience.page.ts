import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminExperience, AdminExperienceDataAccess } from './admin-experience.data-access';

@Component({ selector: 'app-admin-experience-page', imports: [RouterLink], template: `<main><h1>Admin experience</h1>@for (experience of experiences; track experience.id) { <article><h2>{{ experience.organization }}</h2><p>{{ experience.role }}</p><p>Status: {{ experience.status }}</p><a [routerLink]="['/admin/experience', experience.id, 'edit']" [attr.aria-label]="'Edit ' + experience.organization">Edit</a></article> }</main>` })
export class AdminExperiencePage {
  private readonly auth = inject(AdminAuthDataAccess); private readonly experienceData = inject(AdminExperienceDataAccess); private readonly router = inject(Router); private readonly platformId = inject(PLATFORM_ID);
  protected experiences: AdminExperience[] = [];
  constructor() { if (!isPlatformBrowser(this.platformId)) return; this.auth.getSession().subscribe({ next: (session) => session.authenticated ? this.experienceData.getExperiences().subscribe((experiences) => this.experiences = experiences) : this.router.navigateByUrl('/admin/login'), error: () => this.router.navigateByUrl('/admin/login') }); }
}
