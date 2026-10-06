import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminEducation, AdminEducationDataAccess } from './admin-education.data-access';

@Component({
  selector: 'app-admin-education-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `<main><h1>Admin education</h1><section aria-label="Create education draft"><h2>Create draft</h2><form [formGroup]="createForm" (ngSubmit)="createDraft()"><label>Institution <input formControlName="institution" /></label><label>Qualification <input formControlName="qualification" /></label><label>Summary <textarea formControlName="summary"></textarea></label><label>Start date <input type="date" formControlName="startDate" /></label><label>End date <input type="date" formControlName="endDate" /></label><button type="submit" [disabled]="createForm.invalid">Create draft</button></form></section>@if (createError()) { <p role="alert">Unable to create the education draft. Please try again.</p> }@for (education of educations; track education.id) { <article><h2>{{ education.institution }}</h2><p>{{ education.qualification }}</p><p>Status: {{ education.status }}</p><a [routerLink]="['/admin/education', education.id, 'edit']" [attr.aria-label]="'Edit ' + education.institution">Edit</a></article> }</main>`,
})
export class AdminEducationPage {
  private readonly auth = inject(AdminAuthDataAccess);
  private readonly educationData = inject(AdminEducationDataAccess);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  protected educations: AdminEducation[] = [];
  protected readonly createError = signal(false);
  protected readonly createForm = new FormGroup({
    institution: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    qualification: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    summary: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    startDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    endDate: new FormControl('', { nonNullable: true }),
  });

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

  protected createDraft() {
    if (this.createForm.invalid) return;
    this.createError.set(false);
    const value = this.createForm.getRawValue();
    this.educationData
      .createDraft({ ...value, endDate: value.endDate || null })
      .subscribe({
        next: (education) => this.router.navigateByUrl(`/admin/education/${education.id}/edit`),
        error: () => this.createError.set(true),
      });
  }
}
