import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminCredentialsDataAccess } from './admin-credentials.data-access';

@Component({
  selector: 'app-admin-credential-editor-page',
  imports: [ReactiveFormsModule],
  template: `<main>
    <h1>Credential editor</h1>
    @if (loaded()) {
      <form [formGroup]="form" (ngSubmit)="save()">
        <label>Name <input formControlName="name" /></label>
        <label>Issuer <input formControlName="issuer" /></label>
        <label>Issued on <input type="date" formControlName="issuedOn" /></label>
        <button type="submit" [disabled]="form.invalid">Save</button>
      </form>
      <form [formGroup]="verificationForm" (ngSubmit)="saveVerification()">
        <label>Verification URL <input type="url" formControlName="verificationUrl" /></label>
        <button type="submit">Save verification URL</button>
      </form>
      <form [formGroup]="expirationForm" (ngSubmit)="saveExpiration()">
        <label>Expires on <input type="date" formControlName="expiresOn" /></label>
        <button type="submit">Save expiration date</button>
      </form>
      <label>Publication status <select [value]="status()" (change)="changeStatus($any($event.target).value)"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
    }
    @if (saveError()) { <p role="alert">Unable to save credential changes. Please try again.</p> }
    @if (verificationError()) { <p role="alert">Unable to save credential verification URL. Please try again.</p> }
    @if (expirationError()) { <p role="alert">Unable to save credential expiration date. Please try again.</p> }
    @if (statusError()) { <p role="alert">Unable to change credential publication status. Please try again.</p> }
  </main>`,
})
export class AdminCredentialEditorPage {
  private readonly auth = inject(AdminAuthDataAccess);
  private readonly data = inject(AdminCredentialsDataAccess);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly loaded = signal(false);
  protected readonly saveError = signal(false);
  protected readonly verificationError = signal(false);
  protected readonly expirationError = signal(false);
  protected readonly statusError = signal(false);
  protected readonly status = signal<'draft' | 'published' | 'archived'>('draft');
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    issuer: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    issuedOn: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  protected readonly verificationForm = new FormGroup({ verificationUrl: new FormControl('', { nonNullable: true }) });
  protected readonly expirationForm = new FormGroup({ expiresOn: new FormControl('', { nonNullable: true }) });
  private id = '';

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.auth.getSession().subscribe({
      next: (session) => session.authenticated ? this.load() : this.router.navigateByUrl('/admin/login'),
      error: () => this.router.navigateByUrl('/admin/login'),
    });
  }

  protected save() {
    if (!this.id || this.form.invalid) return;
    this.saveError.set(false);
    this.data.updateContent(this.id, this.form.getRawValue()).subscribe({
      next: (value) => this.form.setValue({ name: value.name, issuer: value.issuer, issuedOn: value.issuedOn }),
      error: () => this.saveError.set(true),
    });
  }

  protected saveVerification() {
    if (!this.id) return;
    this.verificationError.set(false);
    const verificationUrl = this.verificationForm.controls.verificationUrl.value.trim() || null;
    this.data.updateVerification(this.id, verificationUrl).subscribe({
      next: (value) => this.verificationForm.setValue({ verificationUrl: value.verificationUrl ?? '' }),
      error: () => this.verificationError.set(true),
    });
  }

  protected saveExpiration() {
    if (!this.id) return;
    this.expirationError.set(false);
    const expiresOn = this.expirationForm.controls.expiresOn.value || null;
    this.data.updateExpiration(this.id, expiresOn).subscribe({
      next: (value) => this.expirationForm.setValue({ expiresOn: value.expiresOn ?? '' }),
      error: () => this.expirationError.set(true),
    });
  }

  protected changeStatus(status: 'draft' | 'published' | 'archived') {
    if (!this.id) return;
    this.statusError.set(false);
    this.data.updateStatus(this.id, status).subscribe({
      next: (value) => this.status.set(value.status),
      error: () => this.statusError.set(true),
    });
  }

  private load() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.id = id;
    this.data.getCredential(id).subscribe({
      next: (value) => {
        this.form.setValue({ name: value.name, issuer: value.issuer, issuedOn: value.issuedOn });
        this.verificationForm.setValue({ verificationUrl: value.verificationUrl ?? '' });
        this.expirationForm.setValue({ expiresOn: value.expiresOn ?? '' });
        this.status.set(value.status);
        this.loaded.set(true);
      },
      error: () => this.saveError.set(true),
    });
  }
}
