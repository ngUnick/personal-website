import { ApiProperty } from '@nestjs/swagger';

export class CreateEducationDraftDto {
  @ApiProperty() institution!: string;
  @ApiProperty() qualification!: string;
  @ApiProperty() summary!: string;
  @ApiProperty({ example: '2024-01-01' }) startDate!: string;
  @ApiProperty({ nullable: true, example: null }) endDate!: string | null;
}
