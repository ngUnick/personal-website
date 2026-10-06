import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProfileDataAccess } from '../profile/profile.data-access';
@Component({ selector: 'app-about-page', template: '<main><h1>About</h1>@if (profile(); as profile) { <p>{{ profile.about }}</p> }</main>' })
export class AboutPage { private readonly profileData = inject(ProfileDataAccess); protected readonly profile = toSignal(this.profileData.getProfile()); }
