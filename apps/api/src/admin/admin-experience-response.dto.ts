import { ApiProperty } from '@nestjs/swagger';
import type { AdminExperience } from '../experience/experience.service.js';

export class AdminExperienceResponseDto implements AdminExperience {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() organization!: string;
  @ApiProperty() role!: string;
  @ApiProperty({ enum: ['draft', 'published', 'archived'] }) status!: 'draft' | 'published' | 'archived';
}
