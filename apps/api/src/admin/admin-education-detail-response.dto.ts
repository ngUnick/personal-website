import { ApiProperty } from '@nestjs/swagger';
import { AdminEducationResponseDto } from './admin-education-response.dto.js';

export class AdminEducationDetailResponseDto extends AdminEducationResponseDto {
  @ApiProperty()
  summary!: string;

  @ApiProperty()
  startDate!: string;

  @ApiProperty({ nullable: true })
  endDate!: string | null;
}
