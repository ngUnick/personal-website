import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto.js';

export class ProjectDetailResponseDto extends ProjectResponseDto {
  @ApiProperty({ nullable: true, example: 'Software Engineer' })
  role!: string | null;

  @ApiProperty({ example: 'Fictional plain-text case-study narrative.' })
  caseStudy!: string;

  @ApiProperty({ nullable: true, example: 'https://github.com/example/project' })
  repositoryUrl!: string | null;

  @ApiProperty({ nullable: true, example: 'https://example.invalid/project' })
  liveUrl!: string | null;

  @ApiProperty({ type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, category: { type: 'string' } } } })
  technologies!: { name: string; category: string }[];
}
