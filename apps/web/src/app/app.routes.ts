import { Routes } from '@angular/router';
import { ProjectsPage } from './projects/projects.page';
import { ProjectDetailPage } from './projects/project-detail.page';
import { HomePage } from './home/home.page';
import { ExperiencePage } from './experience/experience.page';
import { AdminLoginPage } from './admin-auth/admin-login.page';
import { AdminPage } from './admin-auth/admin.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomePage },
  { path: 'experience', component: ExperiencePage },
  { path: 'admin/login', component: AdminLoginPage },
  { path: 'admin', component: AdminPage },
  { path: 'projects', component: ProjectsPage },
  { path: 'projects/:slug', component: ProjectDetailPage },
];
