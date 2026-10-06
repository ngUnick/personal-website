import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { ExperienceModule } from './experience/experience.module.js';
import { AdminAuthModule } from './admin-auth/admin-auth.module.js';
import { AdminModule } from './admin/admin.module.js';
import { EducationModule } from './education/education.module.js';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    ProjectsModule,
    ExperienceModule,
    AdminAuthModule,
    AdminModule,
    EducationModule,
  ],
})
export class AppModule {}
