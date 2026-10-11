import { ApiProperty } from '@nestjs/swagger';
export class UpdateProfileLinksDto {
  @ApiProperty({ nullable: true }) githubUrl!: string | null;
  @ApiProperty({ nullable: true }) linkedinUrl!: string | null;
}
