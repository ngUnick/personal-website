import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ExperienceService } from '../experience/experience.service.js';
import { AdminSessionGuard } from './admin-session.guard.js';
import { TrustedOriginGuard } from './trusted-origin.guard.js';
import { AdminExperienceResponseDto } from './admin-experience-response.dto.js';
import { AdminExperienceDetailResponseDto } from './admin-experience-detail-response.dto.js';
import { UpdateExperienceContentDto } from './update-experience-content.dto.js';
import { UpdateExperienceStatusDto } from './update-experience-status.dto.js';
import { CreateExperienceDraftDto } from './create-experience-draft.dto.js';
import { UpdateExperienceOrderDto } from './update-experience-order.dto.js';
import { UpdateExperienceFeaturedDto } from './update-experience-featured.dto.js';
import { UpdateExperienceLocationDto } from './update-experience-location.dto.js';
import { UpdateExperienceOrganizationUrlDto } from './update-experience-organization-url.dto.js';
import { UpdateExperienceTechnologiesDto } from './update-experience-technologies.dto.js';

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

  @Post()
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: CreateExperienceDraftDto })
  @ApiCreatedResponse({ type: AdminExperienceDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async createDraft(@Body() body: CreateExperienceDraftDto) {
    return this.experience.createDraft(this.validContent(body));
  }

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
    return this.experience.updateContent(id, this.validContent(body));
  }

  private validContent(body: UpdateExperienceContentDto | CreateExperienceDraftDto) {
    const organization = typeof body?.organization === 'string' ? body.organization.trim() : '';
    const role = typeof body?.role === 'string' ? body.role.trim() : '';
    const summary = typeof body?.summary === 'string' ? body.summary.trim() : '';
    const startDate = typeof body?.startDate === 'string' ? body.startDate : '';
    const endDate = body?.endDate === null ? null : typeof body?.endDate === 'string' ? body.endDate : undefined;
    if (!organization || !role || !summary || !isCalendarDate(startDate) || (endDate !== null && (!endDate || !isCalendarDate(endDate))) || (endDate !== null && endDate < startDate)) throw new BadRequestException('Valid experience content and chronological calendar dates are required.');
    return { organization, role, summary, startDate, endDate };
  }

  @Patch(':id/status')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateExperienceStatusDto })
  @ApiOkResponse({ type: AdminExperienceDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async updateStatus(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() body: UpdateExperienceStatusDto) {
    const status = body?.status;
    if (!['draft', 'published', 'archived'].includes(status)) throw new BadRequestException('A valid experience publication status is required.');
    return this.experience.updateStatus(id, status);
  }

  @Patch(':id/featured')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateExperienceFeaturedDto })
  @ApiOkResponse({ type: AdminExperienceDetailResponseDto })
  async updateFeatured(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() body: UpdateExperienceFeaturedDto) {
    if (typeof body?.featured !== 'boolean') throw new BadRequestException('A boolean featured value is required.');
    return this.experience.updateFeatured(id, body.featured);
  }

  @Patch(':id/location')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateExperienceLocationDto })
  @ApiOkResponse({ type: AdminExperienceDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async updateLocation(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() body: UpdateExperienceLocationDto) {
    const location = body?.location === null ? null : typeof body?.location === 'string' ? body.location.trim() : undefined;
    if (location === undefined || location === '') throw new BadRequestException('A non-empty location or null is required.');
    return this.experience.updateLocation(id, location);
  }

  @Patch(':id/organization-url')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateExperienceOrganizationUrlDto })
  @ApiOkResponse({ type: AdminExperienceDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async updateOrganizationUrl(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() body: UpdateExperienceOrganizationUrlDto) {
    const organizationUrl = body?.organizationUrl === null ? null : typeof body?.organizationUrl === 'string' ? body.organizationUrl.trim() : undefined;
    if (organizationUrl === undefined || organizationUrl === '' || (organizationUrl !== null && !this.isHttpsUrl(organizationUrl))) throw new BadRequestException('An absolute HTTPS organization URL or null is required.');
    return this.experience.updateOrganizationUrl(id, organizationUrl);
  }

  @Patch(':id/technologies')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateExperienceTechnologiesDto })
  @ApiOkResponse({ type: AdminExperienceDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async updateTechnologies(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() body: UpdateExperienceTechnologiesDto) {
    const technologyIds = body?.technologyIds;
    if (!Array.isArray(technologyIds) || technologyIds.some((technologyId) => typeof technologyId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(technologyId)) || new Set(technologyIds).size !== technologyIds.length) throw new BadRequestException('Technology IDs must be unique UUIDs.');
    return this.experience.updateTechnologies(id, technologyIds);
  }

  @Patch(':id/order')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateExperienceOrderDto })
  @ApiOkResponse({ type: AdminExperienceResponseDto, isArray: true })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async updateOrder(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() body: UpdateExperienceOrderDto) {
    const direction = body?.direction;
    if (direction !== 'up' && direction !== 'down') throw new BadRequestException('A valid experience order direction is required.');
    return this.experience.moveExperience(id, direction);
  }

  private isHttpsUrl(value: string) {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }
}
