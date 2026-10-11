import { ApiProperty } from '@nestjs/swagger';
import type { AdminProjectDetail } from '../projects/projects.service.js';

export class AdminProjectDetailResponseDto implements AdminProjectDetail {
  @ApiProperty() slug!: string;
  @ApiProperty() title!: string;
  @ApiProperty() summary!: string;
  @ApiProperty() caseStudy!: string;
  @ApiProperty({ nullable: true }) repositoryUrl!: string | null;
  @ApiProperty({ nullable: true }) liveUrl!: string | null;
  @ApiProperty({ enum: ['draft', 'published', 'archived'] }) status!: 'draft' | 'published' | 'archived';
  @ApiProperty() featured!: boolean;
}
