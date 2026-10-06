import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EducationResponseDto } from './education-response.dto.js';
import { EducationService } from './education.service.js';

@ApiTags('education')
@Controller('education')
export class EducationController {
  constructor(private readonly education: EducationService) {}

  @Get()
  @ApiOkResponse({ type: EducationResponseDto, isArray: true })
  getEducation() {
    return this.education.getEducation();
  }
}
