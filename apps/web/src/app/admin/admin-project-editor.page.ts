import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAuthDataAccess } from '../admin-auth/admin-auth.data-access';
import { AdminProjectDetail, AdminProjectsDataAccess, ProjectPublicationStatus } from './admin-projects.data-access';
import { AdminTechnologiesDataAccess, AdminTechnology } from './admin-technologies.data-access';

@Component({
  selector: 'app-admin-project-editor-page',
  imports: [ReactiveFormsModule],
  template: `<main><h1>Project editor</h1>@if (project) { <form [formGroup]="form" (ngSubmit)="save()"><label>Title <input formControlName="title" /></label><label>Summary <textarea formControlName="summary"></textarea></label><label>Case study <textarea formControlName="caseStudy"></textarea></label><button type="submit" [disabled]="form.invalid">Save</button></form><section aria-label="Project role"><h2>Project role</h2><form [formGroup]="roleForm" (ngSubmit)="saveRole()"><label>Role <input formControlName="role" /></label><button type="submit">Save project role</button></form></section><section aria-label="Start date"><h2>Start date</h2><form [formGroup]="startDateForm" (ngSubmit)="saveStartDate()"><label>Started on <input type="date" formControlName="startedOn" /></label><button type="submit">Save start date</button></form></section><section aria-label="Completion date"><h2>Completion date</h2><form [formGroup]="completionDateForm" (ngSubmit)="saveCompletionDate()"><label>Completed on <input type="date" formControlName="completedOn" /></label><button type="submit">Save completion date</button></form></section><section aria-label="Project links"><h2>Project links</h2><form [formGroup]="linksForm" (ngSubmit)="saveLinks()"><label>Repository <input type="url" formControlName="repositoryUrl" /></label><label>Live project <input type="url" formControlName="liveUrl" /></label><button type="submit" [disabled]="linksForm.invalid">Save project links</button></form></section><section aria-label="Technologies"><h2>Technologies</h2>@for (technology of technologies; track technology.id) { <label><input type="checkbox" [checked]="technologyIds.value.includes(technology.id)" (change)="toggleTechnology(technology.id, $any($event.target).checked)" />{{ technology.name }} — {{ technology.category }}</label> }<button type="button" (click)="saveTechnologies()">Save technologies</button></section><section aria-label="Publication status"><h2>Publication</h2><label>Status <select [formControl]="statusControl"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><button type="button" (click)="updateStatus()">Update publication status</button></section><section aria-label="Private project preview"><h2>Preview</h2><h3>{{ project.title }}</h3><p>{{ project.summary }}</p>@if (project.role) { <p>Role: {{ project.role }}</p> }<p>{{ project.caseStudy }}</p><p>Status: {{ project.status }}</p></section> }@if (saveError()) { <p role="alert">Unable to save project changes. Please try again.</p> }@if (roleError()) { <p role="alert">Unable to save project role. Please try again.</p> }@if (startDateError()) { <p role="alert">Unable to save project start date. Please try again.</p> }@if (completionDateError()) { <p role="alert">Unable to save project completion date. Please try again.</p> }@if (linksError()) { <p role="alert">Unable to save project links. Please try again.</p> }@if (statusError()) { <p role="alert">Unable to update publication status. Please try again.</p> }@if (technologiesError()) { <p role="alert">Unable to save project technologies. Please try again.</p> }</main>`,
})
export class AdminProjectEditorPage {
  private readonly auth = inject(AdminAuthDataAccess);
  private readonly projects = inject(AdminProjectsDataAccess);
  private readonly technologyDataAccess = inject(AdminTechnologiesDataAccess, { optional: true });
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  protected project: AdminProjectDetail | undefined;
  protected readonly saveError = signal(false);
  protected readonly statusError = signal(false);
  protected readonly linksError = signal(false);
  protected readonly completionDateError = signal(false);
  protected readonly startDateError = signal(false);
  protected readonly roleError = signal(false);
  protected readonly technologiesError = signal(false);
  protected technologies: AdminTechnology[] = [];
  protected readonly form = new FormGroup({ title: new FormControl('', { nonNullable: true, validators: [Validators.required] }), summary: new FormControl('', { nonNullable: true, validators: [Validators.required] }), caseStudy: new FormControl('', { nonNullable: true }) });
  protected readonly statusControl = new FormControl<ProjectPublicationStatus>('draft', { nonNullable: true });
  protected readonly linksForm = new FormGroup({ repositoryUrl: new FormControl('', { nonNullable: true }), liveUrl: new FormControl('', { nonNullable: true }) });
  protected readonly completionDateForm = new FormGroup({ completedOn: new FormControl('', { nonNullable: true }) });
  protected readonly startDateForm = new FormGroup({ startedOn: new FormControl('', { nonNullable: true }) });
  protected readonly roleForm = new FormGroup({ role: new FormControl('', { nonNullable: true }) });
  protected readonly technologyIds = new FormControl<string[]>([], { nonNullable: true });
  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.auth.getSession().subscribe({ next: (session) => session.authenticated ? this.load() : this.router.navigateByUrl('/admin/login'), error: () => this.router.navigateByUrl('/admin/login') });
  }
  protected save() { if (!this.project || this.form.invalid) return; this.saveError.set(false); this.projects.updateContent(this.project.slug, this.form.getRawValue()).subscribe({ next: (project) => this.applyProject(project), error: () => this.saveError.set(true) }); }
  protected updateStatus() { if (!this.project) return; this.statusError.set(false); this.projects.updateStatus(this.project.slug, this.statusControl.getRawValue()).subscribe({ next: (project) => this.applyProject(project), error: () => this.statusError.set(true) }); }
  protected saveLinks() { if (!this.project || this.linksForm.invalid) return; this.linksError.set(false); const links = this.linksForm.getRawValue(); this.projects.updateLinks(this.project.slug, { repositoryUrl: links.repositoryUrl.trim() || null, liveUrl: links.liveUrl.trim() || null }).subscribe({ next: (project) => this.applyProject(project), error: () => this.linksError.set(true) }); }
  protected saveCompletionDate() { if (!this.project) return; this.completionDateError.set(false); this.projects.updateCompletionDate(this.project.slug, this.completionDateForm.controls.completedOn.value || null).subscribe({ next: (project) => this.applyProject(project), error: () => this.completionDateError.set(true) }); }
  protected saveStartDate() { if (!this.project) return; this.startDateError.set(false); this.projects.updateStartDate(this.project.slug, this.startDateForm.controls.startedOn.value || null).subscribe({ next: (project) => this.applyProject(project), error: () => this.startDateError.set(true) }); }
  protected saveRole() { if (!this.project) return; this.roleError.set(false); this.projects.updateRole(this.project.slug, this.roleForm.controls.role.value.trim() || null).subscribe({ next: (project) => this.applyProject(project), error: () => this.roleError.set(true) }); }
  protected toggleTechnology(id: string, checked: boolean) { const ids = this.technologyIds.value; this.technologyIds.setValue(checked ? [...ids, id] : ids.filter((technologyId) => technologyId !== id)); }
  protected saveTechnologies() { if (!this.project) return; this.technologiesError.set(false); this.projects.updateTechnologies(this.project.slug, this.technologyIds.value).subscribe({ next: (project) => this.applyProject(project), error: () => this.technologiesError.set(true) }); }
  private load() { const slug = this.route.snapshot.paramMap.get('slug'); if (slug) this.projects.getProject(slug).subscribe((project) => this.applyProject(project)); this.technologyDataAccess?.getTechnologies().subscribe((technologies) => this.technologies = technologies); }
  private applyProject(project: AdminProjectDetail) { this.project = project; this.form.setValue({ title: project.title, summary: project.summary, caseStudy: project.caseStudy ?? '' }); this.roleForm.setValue({ role: project.role ?? '' }); this.startDateForm.setValue({ startedOn: project.startedOn ?? '' }); this.completionDateForm.setValue({ completedOn: project.completedOn ?? '' }); this.linksForm.setValue({ repositoryUrl: project.repositoryUrl ?? '', liveUrl: project.liveUrl ?? '' }); this.technologyIds.setValue(project.technologyIds ?? []); this.statusControl.setValue(project.status); }
}
