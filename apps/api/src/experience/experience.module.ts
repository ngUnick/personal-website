import { Module } from '@nestjs/common';
import { DrizzleExperiencePersistence } from './drizzle-experience.persistence.js';
import { ExperienceController } from './experience.controller.js';
import { EXPERIENCE_PERSISTENCE } from './experience.persistence.js';
import { ExperienceService } from './experience.service.js';

@Module({
  controllers: [ExperienceController],
  providers: [
    ExperienceService,
    DrizzleExperiencePersistence,
    {
      provide: EXPERIENCE_PERSISTENCE,
      useExisting: DrizzleExperiencePersistence,
    },
  ],
})
export class ExperienceModule {}
