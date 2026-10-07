import { Observable } from 'rxjs';
export type AdminCredential = { id: string; name: string; issuer: string; status: 'draft' | 'published' | 'archived' };
export type AdminCredentialDetail = AdminCredential & { issuedOn: string };
export type CredentialContentUpdate = Pick<AdminCredentialDetail, 'name' | 'issuer' | 'issuedOn'>;
export abstract class AdminCredentialsDataAccess { abstract getCredentials(): Observable<AdminCredential[]>; abstract getCredential(id: string): Observable<AdminCredentialDetail>; abstract updateContent(id: string, content: CredentialContentUpdate): Observable<AdminCredentialDetail>; abstract updateStatus(id: string, status: AdminCredential['status']): Observable<AdminCredentialDetail>; }
