import { ApiProperty } from '@nestjs/swagger';

export class UpdateExperienceLocationDto {
  @ApiProperty({ nullable: true, example: 'Remote' })
  location!: string | null;
}
