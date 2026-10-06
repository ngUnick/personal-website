import { Observable } from 'rxjs';
export type Technology = { name: string; category: string };
export abstract class TechnologyDataAccess { abstract getTechnologies(): Observable<Technology[]>; }
