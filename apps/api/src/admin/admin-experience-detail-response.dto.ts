import { ApiProperty } from '@nestjs/swagger';
import type { AdminExperienceDetail } from '../experience/experience.service.js';

export class AdminExperienceDetailResponseDto implements AdminExperienceDetail {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() organization!: string;
  @ApiProperty() role!: string;
  @ApiProperty() summary!: string;
  @ApiProperty({ example: '2025-01-01' }) startDate!: string;
  @ApiProperty({ example: '2025-12-31', nullable: true }) endDate!: string | null;
  @ApiProperty({ enum: ['draft', 'published', 'archived'] }) status!: 'draft' | 'published' | 'archived';
}
