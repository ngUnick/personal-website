import { Observable } from 'rxjs';
export type AdminCredential = { id: string; name: string; issuer: string; status: 'draft' | 'published' | 'archived' };
export type AdminCredentialDetail = AdminCredential & { issuedOn: string; expiresOn: string | null; verificationUrl: string | null };
export type CredentialContentUpdate = Pick<AdminCredentialDetail, 'name' | 'issuer' | 'issuedOn'>;
export type CreateCredentialDraft = CredentialContentUpdate;
export type CredentialOrderDirection = 'up' | 'down';
export abstract class AdminCredentialsDataAccess { abstract getCredentials(): Observable<AdminCredential[]>; abstract getCredential(id: string): Observable<AdminCredentialDetail>; abstract createDraft(input: CreateCredentialDraft): Observable<AdminCredentialDetail>; abstract updateContent(id: string, content: CredentialContentUpdate): Observable<AdminCredentialDetail>; abstract updateStatus(id: string, status: AdminCredential['status']): Observable<AdminCredentialDetail>; abstract updateVerification(id: string, verificationUrl: string | null): Observable<AdminCredentialDetail>; abstract updateExpiration(id: string, expiresOn: string | null): Observable<AdminCredentialDetail>; abstract moveCredential(id: string, direction: CredentialOrderDirection): Observable<AdminCredential[]>; }
