import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto.js';
import { ProjectDetailResponseDto } from './project-detail-response.dto.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOkResponse({ type: ProjectResponseDto, isArray: true })
  @ApiQuery({
    name: 'featured',
    required: false,
    type: Boolean,
    description: 'When true, return only featured published projects.',
  })
  async getProjects(
    @Query('featured') featured?: string,
  ): Promise<ProjectResponseDto[]> {
    if (featured === 'true') {
      return this.projectsService.getFeaturedProjects();
    }

    return this.projectsService.getProjects();
  }

  @Get(':slug')
  @ApiOkResponse({ type: ProjectDetailResponseDto })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  async getProject(@Param('slug') slug: string): Promise<ProjectDetailResponseDto> {
    return this.projectsService.getProject(slug);
  }
}
