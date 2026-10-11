import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectTechnologiesDto {
  @ApiProperty({ type: [String] })
  technologyIds!: string[];
}
