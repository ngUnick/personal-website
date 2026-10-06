import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { DrizzleTechnologyPersistence } from './drizzle-technology.persistence.js';
import { TechnologyController } from './technology.controller.js';
import { TECHNOLOGY_PERSISTENCE } from './technology.persistence.js';
import { TechnologyService } from './technology.service.js';
@Module({ imports: [DatabaseModule], controllers: [TechnologyController], providers: [TechnologyService, { provide: TECHNOLOGY_PERSISTENCE, useClass: DrizzleTechnologyPersistence }], exports: [TechnologyService] })
export class TechnologyModule {}
