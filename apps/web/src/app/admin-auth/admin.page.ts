import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthDataAccess } from './admin-auth.data-access';
import { AdminProjectsDataAccess, AdminProject } from '../admin/admin-projects.data-access';

@Component({
  selector: 'app-admin-page',
  imports: [RouterLink],
  template: `<main><h1>Admin projects</h1>@for (project of projects; track project.slug) { <article><h2>{{ project.title }}</h2><p>Status: {{ project.status }}</p><button type="button" [attr.aria-pressed]="project.featured" [attr.aria-label]="'Toggle featured for ' + project.title" (click)="toggleFeatured(project)">Featured: {{ project.featured ? 'Yes' : 'No' }}</button><a [routerLink]="['/admin/projects', project.slug, 'edit']" [attr.aria-label]="'Edit ' + project.title">Edit</a></article> }</main>`,
})
export class AdminPage {
  private readonly auth = inject(AdminAuthDataAccess);
  private readonly projectsDataAccess = inject(AdminProjectsDataAccess);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  protected projects: AdminProject[] = [];
  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.auth.getSession().subscribe({ next: (session) => session.authenticated ? this.loadProjects() : this.router.navigateByUrl('/admin/login'), error: () => this.router.navigateByUrl('/admin/login') });
  }
  protected toggleFeatured(project: AdminProject) { this.projectsDataAccess.updateFeatured(project.slug, !project.featured).subscribe((updated) => (this.projects = this.projects.map((item) => item.slug === updated.slug ? updated : item))); }
  private loadProjects() { this.projectsDataAccess.getProjects().subscribe((projects) => (this.projects = projects)); }
}
