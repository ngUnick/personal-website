import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfileDataAccess } from '../profile/profile.data-access';
import { CredentialDataAccess } from '../credentials/credential.data-access';
import { AboutPage } from './about.page';

describe('AboutPage', () => {
  const profile = {
    headline: 'Example Software Engineer',
    summary: 'Summary',
    about: 'Fictional about text.',
    location: 'Remote',
  };

  it('renders Profile About content, public Credentials in API order, expiration only when present, and verification links only when present', async () => {
    let credentialReads = 0;
    await TestBed.configureTestingModule({
      imports: [AboutPage],
      providers: [
        { provide: ProfileDataAccess, useValue: { getProfile: () => of(profile) } },
        {
          provide: CredentialDataAccess,
          useValue: {
            getCredentials: () => {
              credentialReads++;
              return of([
                {
                  name: 'First credential',
                  issuer: 'First issuer',
                  issuedOn: '2025-01-01',
                  expiresOn: '2027-01-01',
                  issuerUrl: 'https://issuer.example/first',
                  verificationUrl: 'https://verify.example/first',
                },
                {
                  name: 'Second credential',
                  issuer: 'Second issuer',
                  issuedOn: '2026-01-01',
                  expiresOn: null,
                  issuerUrl: null,
                  verificationUrl: null,
                },
              ]);
            },
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AboutPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Fictional about text.');
    expect(text).toContain('Remote');
    expect(text.indexOf('First credential')).toBeLessThan(text.indexOf('Second credential'));
    expect(text).toContain('First issuer');
    expect(text).toContain('2026-01-01');
    expect(text).toContain('2027-01-01');
    expect(credentialReads).toBe(1);
    const links = [...fixture.nativeElement.querySelectorAll('a')];
    expect(
      links
        .filter((link: HTMLAnchorElement) => link.textContent?.trim() === 'Verify credential')
        .map((link: HTMLAnchorElement) => link.href),
    ).toEqual(['https://verify.example/first']);
    expect(links.filter((link: HTMLAnchorElement) => link.textContent?.trim() === 'First issuer').map((link: HTMLAnchorElement) => link.href)).toEqual(['https://issuer.example/first']);
  });

  it('omits the Credentials section when no published Credentials are available', async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPage],
      providers: [
        { provide: ProfileDataAccess, useValue: { getProfile: () => of(profile) } },
        { provide: CredentialDataAccess, useValue: { getCredentials: () => of([]) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AboutPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[aria-labelledby="credentials-heading"]'),
    ).toBeNull();
  });
});
