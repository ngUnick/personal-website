import { ApiProperty } from '@nestjs/swagger';

export class EducationResponseDto {
  @ApiProperty()
  institution!: string;

  @ApiProperty()
  qualification!: string;

  @ApiProperty()
  summary!: string;

  @ApiProperty({ nullable: true })
  location!: string | null;

  @ApiProperty()
  startDate!: string;

  @ApiProperty({ nullable: true })
  endDate!: string | null;
}
