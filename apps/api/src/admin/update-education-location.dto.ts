import { ApiProperty } from '@nestjs/swagger';

export class UpdateEducationLocationDto {
  @ApiProperty({ nullable: true, example: 'Remote' })
  location!: string | null;
}
