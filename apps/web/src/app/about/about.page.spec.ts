import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfileDataAccess } from '../profile/profile.data-access';
import { CredentialDataAccess } from '../credentials/credential.data-access';
import { AboutPage } from './about.page';

describe('AboutPage', () => {
  const profile = { headline: 'Example Software Engineer', summary: 'Summary', about: 'Fictional about text.' };

  it('renders Profile About content and public Credentials in API order', async () => {
    await TestBed.configureTestingModule({ imports: [AboutPage], providers: [{ provide: ProfileDataAccess, useValue: { getProfile: () => of(profile) } }, { provide: CredentialDataAccess, useValue: { getCredentials: () => of([{ name: 'First credential', issuer: 'First issuer', issuedOn: '2025-01-01' }, { name: 'Second credential', issuer: 'Second issuer', issuedOn: '2026-01-01' }]) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AboutPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Fictional about text.');
    expect(text.indexOf('First credential')).toBeLessThan(text.indexOf('Second credential'));
    expect(text).toContain('First issuer');
    expect(text).toContain('2026-01-01');
  });

  it('omits the Credentials section when no published Credentials are available', async () => {
    await TestBed.configureTestingModule({ imports: [AboutPage], providers: [{ provide: ProfileDataAccess, useValue: { getProfile: () => of(profile) } }, { provide: CredentialDataAccess, useValue: { getCredentials: () => of([]) } }] }).compileComponents();
    const fixture = TestBed.createComponent(AboutPage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[aria-labelledby="credentials-heading"]')).toBeNull();
  });
});
