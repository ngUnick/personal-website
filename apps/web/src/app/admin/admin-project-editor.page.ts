import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminProjectDetail, AdminProjectsDataAccess } from './admin-projects.data-access';

@Component({
  selector: 'app-admin-project-editor-page',
  imports: [ReactiveFormsModule],
  template: `<main><h1>Project editor</h1>@if (project) { <form [formGroup]="form" (ngSubmit)="save()"><label>Title <input formControlName="title" /></label><label>Summary <textarea formControlName="summary"></textarea></label><button type="submit" [disabled]="form.invalid">Save</button></form><section aria-label="Private project preview"><h2>Preview</h2><h3>{{ project.title }}</h3><p>{{ project.summary }}</p><p>Status: {{ project.status }}</p></section> }@if (saveError()) { <p role="alert">Unable to save project changes. Please try again.</p> }</main>`,
})
export class AdminProjectEditorPage {
  private readonly auth = inject(AdminAuthDataAccess);
  private readonly projects = inject(AdminProjectsDataAccess);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  protected project: AdminProjectDetail | undefined;
  protected readonly saveError = signal(false);
  protected readonly form = new FormGroup({ title: new FormControl('', { nonNullable: true, validators: [Validators.required] }), summary: new FormControl('', { nonNullable: true, validators: [Validators.required] }) });
  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.auth.getSession().subscribe({ next: (session) => session.authenticated ? this.load() : this.router.navigateByUrl('/admin/login'), error: () => this.router.navigateByUrl('/admin/login') });
  }
  protected save() { if (!this.project || this.form.invalid) return; this.saveError.set(false); this.projects.updateContent(this.project.slug, this.form.getRawValue()).subscribe({ next: (project) => { this.project = project; this.form.setValue({ title: project.title, summary: project.summary }); }, error: () => this.saveError.set(true) }); }
  private load() { const slug = this.route.snapshot.paramMap.get('slug'); if (slug) this.projects.getProject(slug).subscribe((project) => { this.project = project; this.form.setValue({ title: project.title, summary: project.summary }); }); }
}
