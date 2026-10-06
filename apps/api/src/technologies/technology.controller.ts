import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TechnologyResponseDto } from './technology-response.dto.js';
import { TechnologyService } from './technology.service.js';
@ApiTags('technologies')
@Controller('technologies')
export class TechnologyController { constructor(private readonly technologies: TechnologyService) {} @Get() @ApiOkResponse({ type: TechnologyResponseDto, isArray: true }) getTechnologies() { return this.technologies.getTechnologies(); } }
