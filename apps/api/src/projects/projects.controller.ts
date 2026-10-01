import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOkResponse({ type: ProjectResponseDto, isArray: true })
  getProjects(): ProjectResponseDto[] {
    return this.projectsService.getProjects();
  }
}
