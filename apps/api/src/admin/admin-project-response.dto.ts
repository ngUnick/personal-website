import { ApiProperty } from '@nestjs/swagger';
import type { AdminProject } from '../projects/projects.service.js';

export class AdminProjectResponseDto implements AdminProject {
  @ApiProperty({ example: 'placeholder-project' })
  slug!: string;

  @ApiProperty({ example: 'Placeholder Project' })
  title!: string;

  @ApiProperty({ enum: ['draft', 'published', 'archived'], example: 'published' })
  status!: 'draft' | 'published' | 'archived';

  @ApiProperty({ example: true })
  featured!: boolean;
}
