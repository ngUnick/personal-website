import { ApiProperty } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty({ example: 'placeholder-project' })
  slug!: string;

  @ApiProperty({ example: 'Placeholder Project' })
  title!: string;

  @ApiProperty({ example: 'Temporary sample content used to validate the application path.' })
  summary!: string;
}
