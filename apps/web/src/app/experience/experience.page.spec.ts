import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExperienceDataAccess } from './experience.data-access';
import { ExperiencePage } from './experience.page';

describe('ExperiencePage', () => {
  it('renders experience from its data-access boundary', async () => {
    await TestBed.configureTestingModule({
      imports: [ExperiencePage],
      providers: [
        {
          provide: ExperienceDataAccess,
          useValue: {
            getExperience: () =>
              of([
                {
                  organization: 'Example Software Studio',
                  role: 'Example Software Engineer',
                  summary:
                    'Fictional development fixture used to validate the public experience path.',
                  location: 'Remote',
                  organizationUrl: 'https://example.invalid',
                  startDate: '2024-01-01',
                  endDate: null,
                  technologies: [{ name: 'TypeScript', category: 'Languages' }],
                },
              ]),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ExperiencePage);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Example Software Engineer');
    expect(fixture.nativeElement.textContent).toContain('Example Software Studio');
    expect(fixture.nativeElement.textContent).toContain('Remote');
    expect(fixture.nativeElement.querySelector('a[href="https://example.invalid"]')?.textContent).toContain('Example Software Studio');
    expect(fixture.nativeElement.textContent).toContain('TypeScript — Languages');
  });
});
