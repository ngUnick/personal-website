import { Routes } from '@angular/router';
import { ProjectsPage } from './projects/projects.page';
import { ProjectDetailPage } from './projects/project-detail.page';
import { HomePage } from './home/home.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomePage },
  { path: 'projects', component: ProjectsPage },
  { path: 'projects/:slug', component: ProjectDetailPage },
];
