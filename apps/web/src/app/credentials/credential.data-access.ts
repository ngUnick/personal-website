import { Observable } from 'rxjs';

export type Credential = { name: string; issuer: string; issuedOn: string; verificationUrl: string | null };

export abstract class CredentialDataAccess {
  abstract getCredentials(): Observable<Credential[]>;
}
