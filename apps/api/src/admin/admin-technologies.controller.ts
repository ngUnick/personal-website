import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiBody, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { TechnologyService } from '../technologies/technology.service.js';
import { AdminSessionGuard } from './admin-session.guard.js';
import { AdminTechnologyResponseDto } from './admin-technology-response.dto.js';
import { TrustedOriginGuard } from './trusted-origin.guard.js';
import { UpdateTechnologyContentDto } from './update-technology-content.dto.js';
import { UpdateTechnologyStatusDto } from './update-technology-status.dto.js';
@ApiTags('admin')
@Controller('admin/technologies')
export class AdminTechnologiesController {
  constructor(private readonly technologies: TechnologyService) {}
  @Get() @UseGuards(AdminSessionGuard) @ApiOkResponse({ type: AdminTechnologyResponseDto, isArray: true }) @ApiUnauthorizedResponse() list() { return this.technologies.getAdminTechnologies().then(items => items.map(({ id, name, category, status }) => ({ id, name, category, status }))); }
  @Get(':id') @UseGuards(AdminSessionGuard) @ApiOkResponse({ type: AdminTechnologyResponseDto }) @ApiUnauthorizedResponse() @ApiNotFoundResponse() detail(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) { return this.technologies.getAdminTechnology(id).then(({ id, name, category, status }) => ({ id, name, category, status })); }
  @Patch(':id/content') @UseGuards(AdminSessionGuard, TrustedOriginGuard) @ApiBody({ type: UpdateTechnologyContentDto }) @ApiOkResponse({ type: AdminTechnologyResponseDto }) @ApiUnauthorizedResponse() @ApiForbiddenResponse() @ApiNotFoundResponse() updateContent(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() body: UpdateTechnologyContentDto) { const name = typeof body?.name === 'string' ? body.name.trim() : ''; const category = typeof body?.category === 'string' ? body.category.trim() : ''; if (!name || !category) throw new BadRequestException('Technology name and category are required.'); return this.technologies.updateContent(id, { name, category }).then(({ id, name, category, status }) => ({ id, name, category, status })); }
  @Patch(':id/status') @UseGuards(AdminSessionGuard, TrustedOriginGuard) @ApiBody({ type: UpdateTechnologyStatusDto }) @ApiOkResponse({ type: AdminTechnologyResponseDto }) @ApiUnauthorizedResponse() @ApiForbiddenResponse() @ApiNotFoundResponse() updateStatus(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() body: UpdateTechnologyStatusDto) { const status = body?.status; if (!['draft', 'published', 'archived'].includes(status)) throw new BadRequestException('A valid Technology publication status is required.'); return this.technologies.updateStatus(id, status).then(({ id, name, category, status }) => ({ id, name, category, status })); }
}
