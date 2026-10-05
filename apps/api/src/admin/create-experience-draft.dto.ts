import { ApiProperty } from '@nestjs/swagger';

export class CreateExperienceDraftDto {
  @ApiProperty() organization!: string;
  @ApiProperty() role!: string;
  @ApiProperty() summary!: string;
  @ApiProperty({ example: '2025-01-01' }) startDate!: string;
  @ApiProperty({ nullable: true, example: null }) endDate!: string | null;
}
