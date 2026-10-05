import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto.js';

export class ProjectDetailResponseDto extends ProjectResponseDto {
  @ApiProperty({ example: 'Fictional plain-text case-study narrative.' })
  caseStudy!: string;
}
