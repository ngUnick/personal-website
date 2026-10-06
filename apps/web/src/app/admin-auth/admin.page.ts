import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthDataAccess } from './admin-auth.data-access';
import { AdminProjectsDataAccess, AdminProject } from '../admin/admin-projects.data-access';

@Component({
  selector: 'app-admin-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `<main><h1>Admin projects</h1><p><a routerLink="/admin/profile">Manage profile</a></p><p><a routerLink="/admin/technologies">Manage technologies</a></p><p><a routerLink="/admin/experience">Manage experience</a></p><p><a routerLink="/admin/education">Manage education</a></p><section aria-label="Create project draft"><h2>Create draft</h2><form [formGroup]="createForm" (ngSubmit)="createDraft()"><label>Slug <input formControlName="slug" /></label><label>Title <input formControlName="title" /></label><label>Summary <textarea formControlName="summary"></textarea></label><button type="submit" [disabled]="createForm.invalid">Create draft</button></form></section>@if (createError()) { <p role="alert">Unable to create the project draft. Please try again.</p> }@if (orderError()) { <p role="alert">Unable to update project order. Please try again.</p> }@for (project of projects; track project.slug; let index = $index; let last = $last) { <article><h2>{{ project.title }}</h2><p>Status: {{ project.status }}</p><button type="button" [disabled]="index === 0" [attr.aria-label]="'Move ' + project.title + ' up'" (click)="moveProject(project, 'up')">Move up</button><button type="button" [disabled]="last" [attr.aria-label]="'Move ' + project.title + ' down'" (click)="moveProject(project, 'down')">Move down</button><button type="button" [attr.aria-pressed]="project.featured" [attr.aria-label]="'Toggle featured for ' + project.title" (click)="toggleFeatured(project)">Featured: {{ project.featured ? 'Yes' : 'No' }}</button><a [routerLink]="['/admin/projects', project.slug, 'edit']" [attr.aria-label]="'Edit ' + project.title">Edit</a></article> }</main>`,
})
export class AdminPage {
  private readonly auth = inject(AdminAuthDataAccess);
  private readonly projectsDataAccess = inject(AdminProjectsDataAccess);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  protected projects: AdminProject[] = [];
  protected readonly createError = signal(false);
  protected readonly orderError = signal(false);
  protected readonly createForm = new FormGroup({ slug: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)] }), title: new FormControl('', { nonNullable: true, validators: [Validators.required] }), summary: new FormControl('', { nonNullable: true, validators: [Validators.required] }) });
  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.auth.getSession().subscribe({ next: (session) => session.authenticated ? this.loadProjects() : this.router.navigateByUrl('/admin/login'), error: () => this.router.navigateByUrl('/admin/login') });
  }
  protected toggleFeatured(project: AdminProject) { this.projectsDataAccess.updateFeatured(project.slug, !project.featured).subscribe((updated) => (this.projects = this.projects.map((item) => item.slug === updated.slug ? updated : item))); }
  protected moveProject(project: AdminProject, direction: 'up' | 'down') { this.orderError.set(false); this.projectsDataAccess.moveProject(project.slug, direction).subscribe({ next: (projects) => this.projects = projects, error: () => this.orderError.set(true) }); }
  protected createDraft() { if (this.createForm.invalid) return; this.createError.set(false); this.projectsDataAccess.createDraft(this.createForm.getRawValue()).subscribe({ next: (project) => this.router.navigateByUrl(`/admin/projects/${project.slug}/edit`), error: () => this.createError.set(true) }); }
  private loadProjects() { this.projectsDataAccess.getProjects().subscribe((projects) => (this.projects = projects)); }
}
