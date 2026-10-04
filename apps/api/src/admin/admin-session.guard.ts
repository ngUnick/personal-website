import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AdminAuthService } from '../admin-auth/admin-auth.service.js';
import { getCookie } from '../admin-auth/admin-auth.controller.js';

@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(private readonly auth: AdminAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    await this.auth.requireAuthenticated(getCookie(request));
    return true;
  }
}
