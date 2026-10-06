import { ApiProperty } from '@nestjs/swagger';

export class UpdateEducationStatusDto {
  @ApiProperty({ enum: ['draft', 'published', 'archived'] })
  status!: 'draft' | 'published' | 'archived';
}
