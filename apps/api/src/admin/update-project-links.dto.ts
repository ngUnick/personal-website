import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectLinksDto {
  @ApiProperty({ nullable: true, example: 'https://github.com/example/project' })
  repositoryUrl!: string | null;

  @ApiProperty({ nullable: true, example: 'https://example.invalid/project' })
  liveUrl!: string | null;
}
