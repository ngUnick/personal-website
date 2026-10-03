import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOkResponse({ type: ProjectResponseDto, isArray: true })
  async getProjects(): Promise<ProjectResponseDto[]> {
    return this.projectsService.getProjects();
  }

  @Get(':slug')
  @ApiOkResponse({ type: ProjectResponseDto })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  async getProject(@Param('slug') slug: string): Promise<ProjectResponseDto> {
    return this.projectsService.getProject(slug);
  }
}
