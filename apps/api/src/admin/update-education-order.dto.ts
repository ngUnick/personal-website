import { ApiProperty } from '@nestjs/swagger';

export class UpdateEducationOrderDto {
  @ApiProperty({ enum: ['up', 'down'], example: 'up' })
  direction!: 'up' | 'down';
}
