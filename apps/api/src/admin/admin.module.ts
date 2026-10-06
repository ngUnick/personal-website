import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ExperienceModule } from '../experience/experience.module.js';
import { EducationModule } from '../education/education.module.js';
import { AdminEducationController } from './admin-education.controller.js';
import { AdminExperienceController } from './admin-experience.controller.js';
import { AdminProjectsController } from './admin-projects.controller.js';
import { TrustedOriginGuard } from './trusted-origin.guard.js';
import { AdminSessionGuard } from './admin-session.guard.js';

@Module({
  imports: [AdminAuthModule, ProjectsModule, ExperienceModule, EducationModule],
  controllers: [
    AdminProjectsController,
    AdminExperienceController,
    AdminEducationController,
  ],
  providers: [AdminSessionGuard, TrustedOriginGuard],
})
export class AdminModule {}
