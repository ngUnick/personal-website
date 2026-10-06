import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ExperienceModule } from '../experience/experience.module.js';
import { EducationModule } from '../education/education.module.js';
import { ProfileModule } from '../profile/profile.module.js';
import { AdminEducationController } from './admin-education.controller.js';
import { AdminExperienceController } from './admin-experience.controller.js';
import { AdminProjectsController } from './admin-projects.controller.js';
import { AdminProfileController } from './admin-profile.controller.js';
import { TrustedOriginGuard } from './trusted-origin.guard.js';
import { AdminSessionGuard } from './admin-session.guard.js';

@Module({
  imports: [
    AdminAuthModule,
    ProjectsModule,
    ExperienceModule,
    EducationModule,
    ProfileModule,
  ],
  controllers: [
    AdminProjectsController,
    AdminExperienceController,
    AdminEducationController,
    AdminProfileController,
  ],
  providers: [AdminSessionGuard, TrustedOriginGuard],
})
export class AdminModule {}
