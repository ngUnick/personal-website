import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { ProjectsModule } from './projects/projects.module.js';

@Module({
  imports: [DatabaseModule, HealthModule, ProjectsModule],
})
export class AppModule {}
