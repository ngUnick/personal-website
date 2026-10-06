import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { EducationController } from './education.controller.js';
import { DrizzleEducationPersistence } from './drizzle-education.persistence.js';
import { EDUCATION_PERSISTENCE } from './education.persistence.js';
import { EducationService } from './education.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [EducationController],
  providers: [
    EducationService,
    {
      provide: EDUCATION_PERSISTENCE,
      useClass: DrizzleEducationPersistence,
    },
  ],
  exports: [EducationService],
})
export class EducationModule {}
