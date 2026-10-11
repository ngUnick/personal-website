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
