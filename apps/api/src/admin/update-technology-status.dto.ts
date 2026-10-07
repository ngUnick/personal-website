import { ApiProperty } from '@nestjs/swagger';

export class UpdateTechnologyStatusDto {
  @ApiProperty({ enum: ['draft', 'published', 'archived'] })
  status!: 'draft' | 'published' | 'archived';
}
