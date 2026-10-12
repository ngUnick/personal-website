import { ApiProperty } from '@nestjs/swagger';

export class UpdateEducationInstitutionUrlDto {
  @ApiProperty({ nullable: true, example: 'https://example.invalid' })
  institutionUrl!: string | null;
}
