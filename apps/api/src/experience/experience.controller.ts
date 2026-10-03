import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ExperienceResponseDto } from './experience-response.dto.js';
import { ExperienceService } from './experience.service.js';

@ApiTags('experience')
@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get()
  @ApiOkResponse({ type: ExperienceResponseDto, isArray: true })
  async getExperience(): Promise<ExperienceResponseDto[]> {
    return this.experienceService.getExperience();
  }
}
