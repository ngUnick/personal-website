import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminProjectDetail, AdminProjectsDataAccess, ProjectPublicationStatus } from './admin-projects.data-access';

@Component({
  selector: 'app-admin-project-editor-page',
  imports: [ReactiveFormsModule],
  template: `<main><h1>Project editor</h1>@if (project) { <form [formGroup]="form" (ngSubmit)="save()"><label>Title <input formControlName="title" /></label><label>Summary <textarea formControlName="summary"></textarea></label><button type="submit" [disabled]="form.invalid">Save</button></form><section aria-label="Publication status"><h2>Publication</h2><label>Status <select [formControl]="statusControl"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><button type="button" (click)="updateStatus()">Update publication status</button></section><section aria-label="Private project preview"><h2>Preview</h2><h3>{{ project.title }}</h3><p>{{ project.summary }}</p><p>Status: {{ project.status }}</p></section> }@if (saveError()) { <p role="alert">Unable to save project changes. Please try again.</p> }@if (statusError()) { <p role="alert">Unable to update publication status. Please try again.</p> }</main>`,
})
export class AdminProjectEditorPage {
  private readonly auth = inject(AdminAuthDataAccess);
  private readonly projects = inject(AdminProjectsDataAccess);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  protected project: AdminProjectDetail | undefined;
  protected readonly saveError = signal(false);
  protected readonly statusError = signal(false);
  protected readonly form = new FormGroup({ title: new FormControl('', { nonNullable: true, validators: [Validators.required] }), summary: new FormControl('', { nonNullable: true, validators: [Validators.required] }) });
  protected readonly statusControl = new FormControl<ProjectPublicationStatus>('draft', { nonNullable: true });
  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.auth.getSession().subscribe({ next: (session) => session.authenticated ? this.load() : this.router.navigateByUrl('/admin/login'), error: () => this.router.navigateByUrl('/admin/login') });
  }
  protected save() { if (!this.project || this.form.invalid) return; this.saveError.set(false); this.projects.updateContent(this.project.slug, this.form.getRawValue()).subscribe({ next: (project) => this.applyProject(project), error: () => this.saveError.set(true) }); }
  protected updateStatus() { if (!this.project) return; this.statusError.set(false); this.projects.updateStatus(this.project.slug, this.statusControl.getRawValue()).subscribe({ next: (project) => this.applyProject(project), error: () => this.statusError.set(true) }); }
  private load() { const slug = this.route.snapshot.paramMap.get('slug'); if (slug) this.projects.getProject(slug).subscribe((project) => this.applyProject(project)); }
  private applyProject(project: AdminProjectDetail) { this.project = project; this.form.setValue({ title: project.title, summary: project.summary }); this.statusControl.setValue(project.status); }
}
