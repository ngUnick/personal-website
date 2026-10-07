import { ApiProperty } from '@nestjs/swagger';

export class UpdateCredentialStatusDto {
  @ApiProperty({ enum: ['draft', 'published', 'archived'] })
  status!: 'draft' | 'published' | 'archived';
}
