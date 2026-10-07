import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { CREDENTIAL_PERSISTENCE } from './credential.persistence.js';
import { CredentialService } from './credential.service.js';
import { DrizzleCredentialPersistence } from './drizzle-credential.persistence.js';
@Module({ imports: [DatabaseModule], providers: [CredentialService, { provide: CREDENTIAL_PERSISTENCE, useClass: DrizzleCredentialPersistence }], exports: [CredentialService] })
export class CredentialModule {}
