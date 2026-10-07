import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiBody, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CredentialService } from '../credentials/credential.service.js';
import { AdminSessionGuard } from './admin-session.guard.js';
import { AdminCredentialDetailResponseDto } from './admin-credential-detail-response.dto.js';
import { AdminCredentialResponseDto } from './admin-credential-response.dto.js';
import { TrustedOriginGuard } from './trusted-origin.guard.js';
import { UpdateCredentialContentDto } from './update-credential-content.dto.js';
const calendarDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};
@ApiTags('admin') @Controller('admin/credentials')
export class AdminCredentialsController { constructor(private readonly credentials: CredentialService) {} @Get() @UseGuards(AdminSessionGuard) @ApiOkResponse({ type: AdminCredentialResponseDto, isArray: true }) @ApiUnauthorizedResponse() list() { return this.credentials.getAdminCredentials(); } @Get(':id') @UseGuards(AdminSessionGuard) @ApiOkResponse({ type: AdminCredentialDetailResponseDto }) @ApiUnauthorizedResponse() @ApiNotFoundResponse() detail(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) { return this.credentials.getAdminCredential(id); } @Patch(':id/content') @UseGuards(AdminSessionGuard, TrustedOriginGuard) @ApiBody({ type: UpdateCredentialContentDto }) @ApiOkResponse({ type: AdminCredentialDetailResponseDto }) @ApiUnauthorizedResponse() @ApiForbiddenResponse() @ApiNotFoundResponse() update(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() body: UpdateCredentialContentDto) { const name = typeof body?.name === 'string' ? body.name.trim() : ''; const issuer = typeof body?.issuer === 'string' ? body.issuer.trim() : ''; const issuedOn = typeof body?.issuedOn === 'string' ? body.issuedOn : ''; if (!name || !issuer || !calendarDate(issuedOn)) throw new BadRequestException('Credential name, issuer, and a valid issued date are required.'); return this.credentials.updateContent(id, { name, issuer, issuedOn }); } }
