import { ApiProperty } from '@nestjs/swagger';

export class UpdateExperienceStatusDto {
  @ApiProperty({ enum: ['draft', 'published', 'archived'], example: 'published' })
  status!: 'draft' | 'published' | 'archived';
}
