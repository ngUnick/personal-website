import { Module } from '@nestjs/common';
import { DrizzleProjectsPersistence } from './drizzle-projects.persistence.js';
import { ProjectsController } from './projects.controller.js';
import { PROJECTS_PERSISTENCE } from './projects.persistence.js';
import { ProjectsService } from './projects.service.js';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    DrizzleProjectsPersistence,
    { provide: PROJECTS_PERSISTENCE, useExisting: DrizzleProjectsPersistence },
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
