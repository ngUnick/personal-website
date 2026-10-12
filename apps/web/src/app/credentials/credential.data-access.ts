import { Observable } from 'rxjs';

export type Credential = { name: string; issuer: string; issuedOn: string; expiresOn: string | null; verificationUrl: string | null };

export abstract class CredentialDataAccess {
  abstract getCredentials(): Observable<Credential[]>;
}
