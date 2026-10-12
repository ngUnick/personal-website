import { ApiProperty } from '@nestjs/swagger';

export class UpdateExperienceTechnologiesDto {
  @ApiProperty({ type: [String], format: 'uuid' }) technologyIds!: string[];
}
