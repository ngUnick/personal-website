import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { AdminProjectsController } from './admin-projects.controller.js';
import { TrustedOriginGuard } from './trusted-origin.guard.js';
import { AdminSessionGuard } from './admin-session.guard.js';

@Module({ imports: [AdminAuthModule, ProjectsModule], controllers: [AdminProjectsController], providers: [AdminSessionGuard, TrustedOriginGuard] })
export class AdminModule {}
