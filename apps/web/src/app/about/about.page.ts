import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProfileDataAccess } from '../profile/profile.data-access';
import { CredentialDataAccess } from '../credentials/credential.data-access';
@Component({ selector: 'app-about-page', template: '<main><h1>About</h1>@if (profile(); as profile) { <p>{{ profile.about }}</p> } @if (credentials().length) { <section aria-labelledby="credentials-heading"><h2 id="credentials-heading">Credentials</h2><ul>@for (credential of credentials(); track credential.name + credential.issuer + credential.issuedOn) { <li><strong>{{ credential.name }}</strong><span>{{ credential.issuer }}</span><time [attr.datetime]="credential.issuedOn">{{ credential.issuedOn }}</time></li> }</ul></section> }</main>' })
export class AboutPage { private readonly profileData = inject(ProfileDataAccess); private readonly credentialData = inject(CredentialDataAccess); protected readonly profile = toSignal(this.profileData.getProfile()); protected readonly credentials = toSignal(this.credentialData.getCredentials(), { initialValue: [] }); }
