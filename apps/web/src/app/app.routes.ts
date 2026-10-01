import { Routes } from '@angular/router';
import { ProjectsPage } from './projects/projects.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'projects' },
  { path: 'projects', component: ProjectsPage },
];
