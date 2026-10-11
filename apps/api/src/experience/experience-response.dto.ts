import { ApiProperty } from '@nestjs/swagger';

export class ExperienceResponseDto {
  @ApiProperty()
  organization!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  summary!: string;

  @ApiProperty({ nullable: true })
  location!: string | null;

  @ApiProperty()
  startDate!: string;

  @ApiProperty({ nullable: true })
  endDate!: string | null;
}
