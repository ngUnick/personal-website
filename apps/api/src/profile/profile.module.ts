import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { DrizzleProfilePersistence } from './drizzle-profile.persistence.js';
import { ProfileController } from './profile.controller.js';
import { PROFILE_PERSISTENCE } from './profile.persistence.js';
import { ProfileService } from './profile.service.js';

@Module({ imports: [DatabaseModule], controllers: [ProfileController], providers: [ProfileService, { provide: PROFILE_PERSISTENCE, useClass: DrizzleProfilePersistence }] })
export class ProfileModule {}
