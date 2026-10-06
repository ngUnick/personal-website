import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminTechnology, AdminTechnologiesDataAccess } from './admin-technologies.data-access';
@Component({ selector: 'app-admin-technologies-page', imports: [RouterLink], template: `<main><h1>Admin technologies</h1>@for (technology of technologies; track technology.id) { <article><h2>{{ technology.name }}</h2><p>{{ technology.category }}</p><p>Status: {{ technology.status }}</p><a [routerLink]="['/admin/technologies', technology.id, 'edit']">Edit</a></article> }</main>` })
export class AdminTechnologiesPage { private readonly auth = inject(AdminAuthDataAccess); private readonly data = inject(AdminTechnologiesDataAccess); private readonly router = inject(Router); private readonly platformId = inject(PLATFORM_ID); protected technologies: AdminTechnology[] = []; constructor() { if (!isPlatformBrowser(this.platformId)) return; this.auth.getSession().subscribe({ next: session => session.authenticated ? this.data.getTechnologies().subscribe(items => this.technologies = items) : this.router.navigateByUrl('/admin/login'), error: () => this.router.navigateByUrl('/admin/login') }); } }
