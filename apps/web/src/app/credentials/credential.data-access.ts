import { Observable } from 'rxjs';

export type Credential = { name: string; issuer: string; issuedOn: string };

export abstract class CredentialDataAccess {
  abstract getCredentials(): Observable<Credential[]>;
}
