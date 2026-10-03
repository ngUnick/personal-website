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
  ],
};
