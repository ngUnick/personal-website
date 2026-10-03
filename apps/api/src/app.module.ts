import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { ExperienceModule } from './experience/experience.module.js';

@Module({
  imports: [DatabaseModule, HealthModule, ProjectsModule, ExperienceModule],
})
export class AppModule {}
