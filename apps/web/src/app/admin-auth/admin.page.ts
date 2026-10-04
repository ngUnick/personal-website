import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthDataAccess } from './admin-auth.data-access';
import { AdminProjectsDataAccess, AdminProject } from '../admin/admin-projects.data-access';

@Component({
  selector: 'app-admin-page',
  template: `<main><h1>Admin projects</h1>@if (project) { <article><h2>{{ project.title }}</h2><p>Status: {{ project.status }}</p><button type="button" [attr.aria-pressed]="project.featured" [attr.aria-label]="'Toggle featured for ' + project.title" (click)="toggleFeatured()">Featured: {{ project.featured ? 'Yes' : 'No' }}</button></article> }</main>`,
})
export class AdminPage {
  private readonly auth = inject(AdminAuthDataAccess);
  private readonly projects = inject(AdminProjectsDataAccess);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  protected project: AdminProject | undefined;
  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.auth.getSession().subscribe({ next: (session) => session.authenticated ? this.loadProjects() : this.router.navigateByUrl('/admin/login'), error: () => this.router.navigateByUrl('/admin/login') });
  }
  protected toggleFeatured() { if (this.project) this.projects.updateFeatured(this.project.slug, !this.project.featured).subscribe((project) => (this.project = project)); }
  private loadProjects() { this.projects.getProjects().subscribe((projects) => (this.project = projects[0])); }
}
