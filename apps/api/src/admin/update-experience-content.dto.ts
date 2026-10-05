import { ApiProperty } from '@nestjs/swagger';

export class UpdateExperienceContentDto {
  @ApiProperty() organization!: string;
  @ApiProperty() role!: string;
  @ApiProperty() summary!: string;
  @ApiProperty({ example: '2025-01-01' }) startDate!: string;
  @ApiProperty({ example: '2025-12-31', nullable: true }) endDate!: string | null;
}
