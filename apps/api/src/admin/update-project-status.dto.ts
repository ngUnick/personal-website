import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectStatusDto {
  @ApiProperty({ enum: ['draft', 'published', 'archived'], example: 'published' })
  status!: 'draft' | 'published' | 'archived';
}
