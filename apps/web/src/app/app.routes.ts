import { Routes } from '@angular/router';
import { ProjectsPage } from './projects/projects.page';
import { ProjectDetailPage } from './projects/project-detail.page';
import { HomePage } from './home/home.page';
import { ExperiencePage } from './experience/experience.page';
import { AdminLoginPage } from './admin-auth/admin-login.page';
import { AdminPage } from './admin-auth/admin.page';
import { AdminProjectEditorPage } from './admin/admin-project-editor.page';
import { AdminExperiencePage } from './admin/admin-experience.page';
import { AdminExperienceEditorPage } from './admin/admin-experience-editor.page';
import { AdminEducationPage } from './admin/admin-education.page';
import { AdminEducationEditorPage } from './admin/admin-education-editor.page';
import { AboutPage } from './about/about.page';
import { AdminProfilePage } from './admin/admin-profile.page';
import { AdminTechnologiesPage } from './admin/admin-technologies.page';
import { AdminTechnologyEditorPage } from './admin/admin-technology-editor.page';
import { AdminCredentialsPage } from './admin/admin-credentials.page';
import { AdminCredentialEditorPage } from './admin/admin-credential-editor.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomePage },
  { path: 'experience', component: ExperiencePage },
  { path: 'about', component: AboutPage },
  { path: 'admin/login', component: AdminLoginPage },
  { path: 'admin', component: AdminPage },
  { path: 'admin/profile', component: AdminProfilePage },
  { path: 'admin/technologies', component: AdminTechnologiesPage },
  { path: 'admin/technologies/:id/edit', component: AdminTechnologyEditorPage },
  { path: 'admin/credentials', component: AdminCredentialsPage },
  { path: 'admin/credentials/:id/edit', component: AdminCredentialEditorPage },
  { path: 'admin/projects/:slug/edit', component: AdminProjectEditorPage },
  { path: 'admin/experience', component: AdminExperiencePage },
  { path: 'admin/experience/:id/edit', component: AdminExperienceEditorPage },
  { path: 'admin/education', component: AdminEducationPage },
  { path: 'admin/education/:id/edit', component: AdminEducationEditorPage },
  { path: 'projects', component: ProjectsPage },
  { path: 'projects/:slug', component: ProjectDetailPage },
];
