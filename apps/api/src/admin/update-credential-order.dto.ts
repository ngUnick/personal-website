import { ApiProperty } from '@nestjs/swagger';

export class UpdateCredentialOrderDto {
  @ApiProperty({ enum: ['up', 'down'] }) direction!: 'up' | 'down';
}
