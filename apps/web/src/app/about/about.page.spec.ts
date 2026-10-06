import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfileDataAccess } from '../profile/profile.data-access';
import { AboutPage } from './about.page';

describe('AboutPage', () => { it('renders the public Profile about text', async () => { await TestBed.configureTestingModule({ imports: [AboutPage], providers: [{ provide: ProfileDataAccess, useValue: { getProfile: () => of({ headline: 'Example Software Engineer', summary: 'Summary', about: 'Fictional about text.' }) } }] }).compileComponents(); const fixture = TestBed.createComponent(AboutPage); fixture.detectChanges(); await fixture.whenStable(); expect(fixture.nativeElement.textContent).toContain('Fictional about text.'); }); });
