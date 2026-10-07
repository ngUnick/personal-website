export type CredentialStatus = 'draft' | 'published' | 'archived';
export type AdminCredential = { id: string; name: string; issuer: string; issuedOn: string; status: CredentialStatus; displayOrder: number };
export type CredentialContentUpdate = Pick<AdminCredential, 'name' | 'issuer' | 'issuedOn'>;
export interface CredentialPersistence { findForAdmin(): Promise<AdminCredential[]>; findForAdminById(id: string): Promise<AdminCredential | undefined>; updateContent(id: string, content: CredentialContentUpdate): Promise<AdminCredential | undefined>; updateStatus(id: string, status: CredentialStatus): Promise<AdminCredential | undefined>; }
export const CREDENTIAL_PERSISTENCE = Symbol('CREDENTIAL_PERSISTENCE');
