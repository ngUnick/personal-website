import { ApiProperty } from '@nestjs/swagger';

export class UpdateExperienceOrderDto {
  @ApiProperty({ enum: ['up', 'down'], example: 'up' })
  direction!: 'up' | 'down';
}
