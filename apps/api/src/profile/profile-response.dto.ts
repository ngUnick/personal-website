import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty()
  headline!: string;

  @ApiProperty()
  summary!: string;

  @ApiProperty()
  about!: string;

  @ApiProperty({ nullable: true })
  contactEmail!: string | null;
  @ApiProperty({ nullable: true }) githubUrl!: string | null;
  @ApiProperty({ nullable: true }) linkedinUrl!: string | null;
}
