import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import {
  AdminProfile,
  AdminProfileDataAccess,
} from './admin-profile.data-access';

@Component({
  selector: 'app-admin-profile-page',
  imports: [ReactiveFormsModule],
  template: `<main>
    <h1>Profile editor</h1>
    @if (profileLoaded()) {
      <form [formGroup]="form" (ngSubmit)="save()">
        <label>Headline <input formControlName="headline" /></label>
        <label>Summary <textarea formControlName="summary"></textarea></label>
        <label>About <textarea formControlName="about"></textarea></label>
        <button type="submit" [disabled]="form.invalid">Save</button>
      </form>
    }
    @if (saveError()) {
      <p role="alert">Unable to save profile changes. Please try again.</p>
    }
  </main>`,
})
export class AdminProfilePage {
  private readonly auth = inject(AdminAuthDataAccess);
  private readonly data = inject(AdminProfileDataAccess);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly profileLoaded = signal(false);
  protected readonly saveError = signal(false);
  protected readonly form = new FormGroup({
    headline: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    summary: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    about: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.auth.getSession().subscribe({
      next: (session) =>
        session.authenticated
          ? this.load()
          : this.router.navigateByUrl('/admin/login'),
      error: () => this.router.navigateByUrl('/admin/login'),
    });
  }

  protected save() {
    if (this.form.invalid) return;
    this.saveError.set(false);
    this.data.updateContent(this.form.getRawValue()).subscribe({
      next: (profile) => this.apply(profile),
      error: () => this.saveError.set(true),
    });
  }

  private load() {
    this.data.getProfile().subscribe({
      next: (profile) => this.apply(profile),
      error: () => this.saveError.set(true),
    });
  }

  private apply(profile: AdminProfile) {
    this.form.setValue(profile);
    this.profileLoaded.set(true);
  }
}
