import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileLocationDto {
  @ApiProperty({ nullable: true, example: 'Remote' })
  location!: string | null;
}
