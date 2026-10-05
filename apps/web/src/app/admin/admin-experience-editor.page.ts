import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminExperienceDataAccess, AdminExperienceDetail } from './admin-experience.data-access';

@Component({ selector: 'app-admin-experience-editor-page', imports: [ReactiveFormsModule], template: `<main><h1>Experience editor</h1>@if (experience) { <form [formGroup]="form" (ngSubmit)="save()"><label>Organization <input formControlName="organization" /></label><label>Role <input formControlName="role" /></label><label>Summary <textarea formControlName="summary"></textarea></label><label>Start date <input type="date" formControlName="startDate" /></label><label>End date <input type="date" formControlName="endDate" /></label><button type="submit" [disabled]="form.invalid">Save</button></form><section aria-label="Private experience preview"><h2>Preview</h2><h3>{{ experience.organization }}</h3><p>{{ experience.role }}</p><p>{{ experience.summary }}</p><p>Status: {{ experience.status }}</p></section> }@if (saveError()) { <p role="alert">Unable to save experience changes. Please try again.</p> }</main>` })
export class AdminExperienceEditorPage {
  private readonly auth = inject(AdminAuthDataAccess); private readonly data = inject(AdminExperienceDataAccess); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); private readonly platformId = inject(PLATFORM_ID);
  protected experience: AdminExperienceDetail | undefined; protected readonly saveError = signal(false);
  protected readonly form = new FormGroup({ organization: new FormControl('', { nonNullable: true, validators: [Validators.required] }), role: new FormControl('', { nonNullable: true, validators: [Validators.required] }), summary: new FormControl('', { nonNullable: true, validators: [Validators.required] }), startDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }), endDate: new FormControl('', { nonNullable: true }) });
  constructor() { if (!isPlatformBrowser(this.platformId)) return; this.auth.getSession().subscribe({ next: (session) => session.authenticated ? this.load() : this.router.navigateByUrl('/admin/login'), error: () => this.router.navigateByUrl('/admin/login') }); }
  protected save() { if (!this.experience || this.form.invalid) return; this.saveError.set(false); const value = this.form.getRawValue(); this.data.updateContent(this.experience.id, { ...value, endDate: value.endDate || null }).subscribe({ next: (experience) => this.apply(experience), error: () => this.saveError.set(true) }); }
  private load() { const id = this.route.snapshot.paramMap.get('id'); if (id) this.data.getExperience(id).subscribe((experience) => this.apply(experience)); }
  private apply(experience: AdminExperienceDetail) { this.experience = experience; this.form.setValue({ organization: experience.organization, role: experience.role, summary: experience.summary, startDate: experience.startDate, endDate: experience.endDate ?? '' }); }
}
