import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { apiBaseUrlProvider } from './core/api-base-url';
import { ProjectsDataAccess } from './projects/projects.data-access';
import { ProjectsHttpService } from './projects/projects-http.service';
import { ExperienceDataAccess } from './experience/experience.data-access';
import { ExperienceHttpService } from './experience/experience-http.service';
import { AdminAuthDataAccess } from './admin-auth/admin-auth.data-access';
import { AdminAuthHttpService } from './admin-auth/admin-auth-http.service';
import { AdminProjectsDataAccess } from './admin/admin-projects.data-access';
import { AdminProjectsHttpService } from './admin/admin-projects-http.service';
import { AdminExperienceDataAccess } from './admin/admin-experience.data-access';
import { AdminExperienceHttpService } from './admin/admin-experience-http.service';
import { EducationDataAccess } from './education/education.data-access';
import { EducationHttpService } from './education/education-http.service';
import { AdminEducationDataAccess } from './admin/admin-education.data-access';
import { AdminEducationHttpService } from './admin/admin-education-http.service';
import { ProfileDataAccess } from './profile/profile.data-access';
import { ProfileHttpService } from './profile/profile-http.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    apiBaseUrlProvider,
    { provide: ProjectsDataAccess, useClass: ProjectsHttpService },
    { provide: ExperienceDataAccess, useClass: ExperienceHttpService },
    { provide: AdminAuthDataAccess, useClass: AdminAuthHttpService },
    { provide: AdminProjectsDataAccess, useClass: AdminProjectsHttpService },
    { provide: AdminExperienceDataAccess, useClass: AdminExperienceHttpService },
    { provide: EducationDataAccess, useClass: EducationHttpService },
    { provide: AdminEducationDataAccess, useClass: AdminEducationHttpService },
    { provide: ProfileDataAccess, useClass: ProfileHttpService },
  ],
};
