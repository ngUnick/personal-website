import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';

const trustedOrigin = () => {
  if (process.env.TRUSTED_WEB_ORIGIN) return process.env.TRUSTED_WEB_ORIGIN;
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:4200';
  return undefined;
};

@Injectable()
export class TrustedOriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = trustedOrigin();
    if (!origin || request.headers.origin !== origin) {
      throw new ForbiddenException('A trusted origin is required.');
    }
    return true;
  }
}
