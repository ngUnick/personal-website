import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminEducationDataAccess, AdminEducationDetail } from './admin-education.data-access';

@Component({
  selector: 'app-admin-education-editor-page',
  imports: [ReactiveFormsModule],
  template: `<main><h1>Education editor</h1>@if (education) { <form [formGroup]="form" (ngSubmit)="save()"><label>Institution <input formControlName="institution" /></label><label>Qualification <input formControlName="qualification" /></label><label>Summary <textarea formControlName="summary"></textarea></label><label>Start date <input type="date" formControlName="startDate" /></label><label>End date <input type="date" formControlName="endDate" /></label><button type="submit" [disabled]="form.invalid">Save</button></form><section aria-label="Private education preview"><h2>Preview</h2><h3>{{ education.institution }}</h3><p>{{ education.qualification }}</p><p>{{ education.summary }}</p><p>Status: {{ education.status }}</p></section> }@if (saveError()) { <p role="alert">Unable to save education changes. Please try again.</p> }</main>`,
})
export class AdminEducationEditorPage {
  private readonly auth = inject(AdminAuthDataAccess);
  private readonly data = inject(AdminEducationDataAccess);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  protected education: AdminEducationDetail | undefined;
  protected readonly saveError = signal(false);
  protected readonly form = new FormGroup({
    institution: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    qualification: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    summary: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    startDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    endDate: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.auth.getSession().subscribe({
      next: (session) => (session.authenticated ? this.load() : this.router.navigateByUrl('/admin/login')),
      error: () => this.router.navigateByUrl('/admin/login'),
    });
  }

  protected save() {
    if (!this.education || this.form.invalid) return;
    this.saveError.set(false);
    const value = this.form.getRawValue();
    this.data.updateContent(this.education.id, { ...value, endDate: value.endDate || null }).subscribe({
      next: (education) => this.apply(education),
      error: () => this.saveError.set(true),
    });
  }

  private load() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.data.getEducation(id).subscribe((education) => this.apply(education));
  }

  private apply(education: AdminEducationDetail) {
    this.education = education;
    this.form.setValue({
      institution: education.institution,
      qualification: education.qualification,
      summary: education.summary,
      startDate: education.startDate,
      endDate: education.endDate ?? '',
    });
  }
}
