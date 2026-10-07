import { ApiProperty } from '@nestjs/swagger';

export class UpdateTechnologyOrderDto {
  @ApiProperty({ enum: ['up', 'down'] })
  direction!: 'up' | 'down';
}
