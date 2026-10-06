import { ApiProperty } from '@nestjs/swagger';

export class AdminEducationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  institution!: string;

  @ApiProperty()
  qualification!: string;

  @ApiProperty({ enum: ['draft', 'published', 'archived'] })
  status!: 'draft' | 'published' | 'archived';
}
