import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller.js';
import { ADMIN_AUTH_PERSISTENCE } from './admin-auth.persistence.js';
import { AdminAuthService } from './admin-auth.service.js';
import { DrizzleAdminAuthPersistence } from './drizzle-admin-auth.persistence.js';
@Module({
  controllers: [AdminAuthController],
  providers: [
    AdminAuthService,
    DrizzleAdminAuthPersistence,
    {
      provide: ADMIN_AUTH_PERSISTENCE,
      useExisting: DrizzleAdminAuthPersistence,
    },
  ],
})
export class AdminAuthModule {}
