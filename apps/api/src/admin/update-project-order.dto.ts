import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectOrderDto {
  @ApiProperty({ enum: ['up', 'down'], example: 'up' })
  direction!: 'up' | 'down';
}
