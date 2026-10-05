import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiBody, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ExperienceService } from '../experience/experience.service.js';
import { AdminSessionGuard } from './admin-session.guard.js';
import { TrustedOriginGuard } from './trusted-origin.guard.js';
import { AdminExperienceResponseDto } from './admin-experience-response.dto.js';
import { AdminExperienceDetailResponseDto } from './admin-experience-detail-response.dto.js';
import { UpdateExperienceContentDto } from './update-experience-content.dto.js';

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

@ApiTags('admin')
@Controller('admin/experience')
export class AdminExperienceController {
  constructor(private readonly experience: ExperienceService) {}

  @Get()
  @UseGuards(AdminSessionGuard)
  @ApiOkResponse({ type: AdminExperienceResponseDto, isArray: true })
  @ApiUnauthorizedResponse()
  async list() { return this.experience.getAdminExperiences(); }

  @Get(':id')
  @UseGuards(AdminSessionGuard)
  @ApiOkResponse({ type: AdminExperienceDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  async detail(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) { return this.experience.getAdminExperience(id); }

  @Patch(':id/content')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateExperienceContentDto })
  @ApiOkResponse({ type: AdminExperienceDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async updateContent(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() body: UpdateExperienceContentDto) {
    const organization = typeof body?.organization === 'string' ? body.organization.trim() : '';
    const role = typeof body?.role === 'string' ? body.role.trim() : '';
    const summary = typeof body?.summary === 'string' ? body.summary.trim() : '';
    const startDate = typeof body?.startDate === 'string' ? body.startDate : '';
    const endDate = body?.endDate === null ? null : typeof body?.endDate === 'string' ? body.endDate : undefined;
    if (!organization || !role || !summary || !isCalendarDate(startDate) || (endDate !== null && (!endDate || !isCalendarDate(endDate))) || (endDate !== null && endDate < startDate)) throw new BadRequestException('Valid experience content and chronological calendar dates are required.');
    return this.experience.updateContent(id, { organization, role, summary, startDate, endDate });
  }
}
