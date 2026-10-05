import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectContentDto {
  @ApiProperty({ example: 'Draft Placeholder Project' }) title!: string;
  @ApiProperty({ example: 'Fictional draft content used only to validate private project authoring.' }) summary!: string;
  @ApiProperty({ example: 'Fictional plain-text case-study narrative.' }) caseStudy!: string;
}
