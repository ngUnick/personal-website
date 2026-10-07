export type CredentialStatus = 'draft' | 'published' | 'archived';
export type AdminCredential = { id: string; name: string; issuer: string; issuedOn: string; status: CredentialStatus; displayOrder: number };
export type CredentialContentUpdate = Pick<AdminCredential, 'name' | 'issuer' | 'issuedOn'>;
export type CreateCredentialDraft = CredentialContentUpdate;
export type CredentialOrderDirection = 'up' | 'down';
export interface CredentialPersistence { findForAdmin(): Promise<AdminCredential[]>; findForAdminById(id: string): Promise<AdminCredential | undefined>; createDraft(input: CreateCredentialDraft): Promise<AdminCredential>; updateContent(id: string, content: CredentialContentUpdate): Promise<AdminCredential | undefined>; updateStatus(id: string, status: CredentialStatus): Promise<AdminCredential | undefined>; moveCredential(id: string, direction: CredentialOrderDirection): Promise<AdminCredential[] | undefined>; }
export const CREDENTIAL_PERSISTENCE = Symbol('CREDENTIAL_PERSISTENCE');
