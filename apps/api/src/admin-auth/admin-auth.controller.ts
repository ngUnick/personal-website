import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AdminAuthService, sessionCookieName } from './admin-auth.service.js';

export const getCookie = (request: Request) =>
  request.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookieName}=`))
    ?.slice(sessionCookieName.length + 1);
export const sessionCookieAttributes = (
  expiresAt: Date,
  environment = process.env.NODE_ENV,
) =>
  `Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor((expiresAt.getTime() - Date.now()) / 1000)}${environment === 'production' ? '; Secure' : ''}`;

export const sessionCookie = (
  token: string,
  expiresAt: Date,
  environment = process.env.NODE_ENV,
) =>
  `${sessionCookieName}=${token}; ${sessionCookieAttributes(expiresAt, environment)}`;

export const clearedSessionCookie = (environment = process.env.NODE_ENV) =>
  `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${environment === 'production' ? '; Secure' : ''}`;

@ApiTags('admin-auth')
@Controller('admin-auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}
  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Session established.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  async login(
    @Body() body: { loginIdentifier?: string; password?: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.adminAuthService.login(
      body.loginIdentifier ?? '',
      body.password ?? '',
    );
    response.setHeader(
      'Set-Cookie',
      sessionCookie(session.token, session.expiresAt),
    );
    return { authenticated: true };
  }
  @Get('session')
  async getSession(@Req() request: Request) {
    return this.adminAuthService.getCurrent(getCookie(request));
  }
  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.adminAuthService.logout(getCookie(request));
    response.setHeader(
      'Set-Cookie',
      clearedSessionCookie(),
    );
    return { authenticated: false };
  }
}
