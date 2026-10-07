import { Observable } from 'rxjs';
export type AdminTechnology = { id: string; name: string; category: string; status: 'draft' | 'published' | 'archived' };
export type TechnologyContentUpdate = Pick<AdminTechnology, 'name' | 'category'>;
export type CreateTechnologyDraft = TechnologyContentUpdate;
export abstract class AdminTechnologiesDataAccess { abstract getTechnologies(): Observable<AdminTechnology[]>; abstract getTechnology(id: string): Observable<AdminTechnology>; abstract createDraft(input: CreateTechnologyDraft): Observable<AdminTechnology>; abstract updateContent(id: string, content: TechnologyContentUpdate): Observable<AdminTechnology>; abstract updateStatus(id: string, status: AdminTechnology['status']): Observable<AdminTechnology>; }
