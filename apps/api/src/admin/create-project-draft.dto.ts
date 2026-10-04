import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDraftDto {
  @ApiProperty({ example: 'fictional-new-project' }) slug!: string;
  @ApiProperty({ example: 'Fictional New Project' }) title!: string;
  @ApiProperty({ example: 'Fictional content used only to validate project creation.' }) summary!: string;
}
