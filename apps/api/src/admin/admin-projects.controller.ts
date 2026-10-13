import { BadRequestException, Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ProjectsService } from '../projects/projects.service.js';
import { AdminSessionGuard } from './admin-session.guard.js';
import { TrustedOriginGuard } from './trusted-origin.guard.js';
import { AdminProjectResponseDto } from './admin-project-response.dto.js';
import { UpdateProjectFeaturedDto } from './update-project-featured.dto.js';
import { AdminProjectDetailResponseDto } from './admin-project-detail-response.dto.js';
import { UpdateProjectContentDto } from './update-project-content.dto.js';
import { UpdateProjectStatusDto } from './update-project-status.dto.js';
import { CreateProjectDraftDto } from './create-project-draft.dto.js';
import { UpdateProjectOrderDto } from './update-project-order.dto.js';
import { UpdateProjectLinksDto } from './update-project-links.dto.js';
import { UpdateProjectTechnologiesDto } from './update-project-technologies.dto.js';
import { UpdateProjectCompletionDateDto } from './update-project-completion-date.dto.js';
import { UpdateProjectStartDateDto } from './update-project-start-date.dto.js';
import { UpdateProjectRoleDto } from './update-project-role.dto.js';

const calendarDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

@ApiTags('admin')
@Controller('admin/projects')
export class AdminProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  @ApiOkResponse({ description: 'Authenticated admin project listing.', type: AdminProjectResponseDto, isArray: true })
  @ApiUnauthorizedResponse()
  @UseGuards(AdminSessionGuard)
  async list() {
    return this.projects.getAdminProjects();
  }

  @Post()
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: CreateProjectDraftDto })
  @ApiCreatedResponse({ type: AdminProjectDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse({ description: 'A trusted origin is required.' })
  @ApiConflictResponse({ description: 'Project slug already exists.' })
  async createDraft(@Body() body: CreateProjectDraftDto) {
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const summary = typeof body?.summary === 'string' ? body.summary.trim() : '';
    if (!slug || !title || !summary || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new BadRequestException('A lowercase kebab-case slug, title, and summary are required.');
    return this.projects.createDraft(slug, title, summary);
  }

  @Get(':slug')
  @ApiOkResponse({ type: AdminProjectDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse({ description: 'Project not found.' })
  @UseGuards(AdminSessionGuard)
  async detail(@Param('slug') slug: string) {
    return this.projects.getAdminProject(slug);
  }

  @Patch(':slug/content')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateProjectContentDto })
  @ApiOkResponse({ type: AdminProjectDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse({ description: 'A trusted origin is required.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  async updateContent(@Param('slug') slug: string, @Body() body: UpdateProjectContentDto) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
    if (!title || !summary || typeof body.caseStudy !== 'string') throw new BadRequestException('Title and summary must be non-empty strings and case study must be text.');
    return this.projects.updateContent(slug, title, summary, body.caseStudy.trim());
  }

  @Patch(':slug/links')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateProjectLinksDto })
  @ApiOkResponse({ type: AdminProjectDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse({ description: 'A trusted origin is required.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  async updateLinks(@Param('slug') slug: string, @Body() body: UpdateProjectLinksDto) {
    return this.projects.updateLinks(
      slug,
      this.validUrl(body?.repositoryUrl),
      this.validUrl(body?.liveUrl),
    );
  }

  @Patch(':slug/completion-date')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateProjectCompletionDateDto })
  @ApiOkResponse({ type: AdminProjectDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse({ description: 'A trusted origin is required.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  updateCompletionDate(@Param('slug') slug: string, @Body() body: UpdateProjectCompletionDateDto) {
    const completedOn = body?.completedOn;
    if (completedOn === null) return this.projects.updateCompletionDate(slug, null);
    if (typeof completedOn !== 'string' || !calendarDate(completedOn)) throw new BadRequestException('A valid completion date or null is required.');
    return this.projects.updateCompletionDate(slug, completedOn);
  }

  @Patch(':slug/start-date')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateProjectStartDateDto })
  @ApiOkResponse({ type: AdminProjectDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse({ description: 'A trusted origin is required.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  updateStartDate(@Param('slug') slug: string, @Body() body: UpdateProjectStartDateDto) {
    const startedOn = body?.startedOn;
    if (startedOn === null) return this.projects.updateStartDate(slug, null);
    if (typeof startedOn !== 'string' || !calendarDate(startedOn)) throw new BadRequestException('A valid start date or null is required.');
    return this.projects.updateStartDate(slug, startedOn);
  }

  @Patch(':slug/role')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateProjectRoleDto })
  @ApiOkResponse({ type: AdminProjectDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse({ description: 'A trusted origin is required.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  updateRole(@Param('slug') slug: string, @Body() body: UpdateProjectRoleDto) {
    if (body?.role === null) return this.projects.updateRole(slug, null);
    if (typeof body?.role !== 'string' || !body.role.trim()) throw new BadRequestException('A non-empty project role or null is required.');
    return this.projects.updateRole(slug, body.role.trim());
  }

  @Patch(':slug/technologies')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateProjectTechnologiesDto })
  @ApiOkResponse({ type: AdminProjectDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse({ description: 'A trusted origin is required.' })
  @ApiNotFoundResponse({ description: 'Project or technology not found.' })
  async updateTechnologies(@Param('slug') slug: string, @Body() body: UpdateProjectTechnologiesDto) {
    const technologyIds = body?.technologyIds;
    if (!Array.isArray(technologyIds) || technologyIds.some((id) => typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) || new Set(technologyIds).size !== technologyIds.length) throw new BadRequestException('Technology IDs must be unique UUIDs.');
    return this.projects.updateTechnologies(slug, technologyIds);
  }

  @Patch(':slug/status')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateProjectStatusDto })
  @ApiOkResponse({ type: AdminProjectDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse({ description: 'A trusted origin is required.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  async updateStatus(@Param('slug') slug: string, @Body() body: UpdateProjectStatusDto) {
    const status = body?.status;
    if (!['draft', 'published', 'archived'].includes(status)) throw new BadRequestException('A valid project publication status is required.');
    return this.projects.updateStatus(slug, status);
  }

  @Patch(':slug/order')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateProjectOrderDto })
  @ApiOkResponse({ type: AdminProjectResponseDto, isArray: true })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse({ description: 'A trusted origin is required.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  async updateOrder(@Param('slug') slug: string, @Body() body: UpdateProjectOrderDto) {
    const direction = body?.direction;
    if (direction !== 'up' && direction !== 'down') throw new BadRequestException('A valid project order direction is required.');
    return this.projects.moveProject(slug, direction);
  }

  @Patch(':slug/featured')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateProjectFeaturedDto })
  @ApiOkResponse({ description: 'Project featured state updated.', type: AdminProjectResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse({ description: 'A trusted origin is required.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  async updateFeatured(@Param('slug') slug: string, @Body() body: UpdateProjectFeaturedDto) {
    if (typeof body.featured !== 'boolean') throw new BadRequestException('A boolean featured value is required.');
    return this.projects.updateFeatured(slug, body.featured);
  }

  private validUrl(value: unknown): string | null {
    if (value === null) return null;
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException('Project links must be absolute HTTPS URLs or null.');
    }
    try {
      const url = new URL(value.trim());
      if (url.protocol !== 'https:') throw new Error();
      return url.href;
    } catch {
      throw new BadRequestException('Project links must be absolute HTTPS URLs or null.');
    }
  }
}
