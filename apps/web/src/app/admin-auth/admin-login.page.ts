import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthDataAccess } from './admin-auth.data-access';

@Component({
  selector: 'app-admin-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-login.page.html',
})
export class AdminLoginPage {
  private readonly auth = inject(AdminAuthDataAccess);
  private readonly router = inject(Router);

  protected readonly form = new FormGroup({
    loginIdentifier: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
  });
  protected failed = false;

  protected submit() {
    const { loginIdentifier, password } = this.form.getRawValue();
    this.auth.login(loginIdentifier, password).subscribe({
      next: () => this.router.navigateByUrl('/admin'),
      error: () => (this.failed = true),
    });
  }
}
