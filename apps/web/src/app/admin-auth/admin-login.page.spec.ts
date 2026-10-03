import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminAuthDataAccess } from './admin-auth.data-access';
import { AdminLoginPage } from './admin-login.page';

describe('AdminLoginPage', () => {
  it('renders the accessible sign-in form', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLoginPage],
      providers: [
        provideRouter([]),
        {
          provide: AdminAuthDataAccess,
          useValue: { login: () => of({ authenticated: true }) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminLoginPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      'Admin login',
    );
    expect(
      fixture.nativeElement.querySelector('input[autocomplete="username"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        'input[autocomplete="current-password"]',
      ),
    ).not.toBeNull();
  });
});
