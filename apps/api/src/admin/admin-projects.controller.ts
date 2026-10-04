import { BadRequestException, Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBody, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ProjectsService } from '../projects/projects.service.js';
import { AdminSessionGuard } from './admin-session.guard.js';
import { TrustedOriginGuard } from './trusted-origin.guard.js';
import { AdminProjectResponseDto } from './admin-project-response.dto.js';
import { UpdateProjectFeaturedDto } from './update-project-featured.dto.js';
import { AdminProjectDetailResponseDto } from './admin-project-detail-response.dto.js';
import { UpdateProjectContentDto } from './update-project-content.dto.js';

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
    if (!title || !summary) throw new BadRequestException('Title and summary must be non-empty strings.');
    return this.projects.updateContent(slug, title, summary);
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
}
