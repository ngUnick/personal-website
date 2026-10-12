import { ApiProperty } from '@nestjs/swagger';

export class UpdateExperienceOrganizationUrlDto {
  @ApiProperty({ nullable: true, example: 'https://example.invalid' })
  organizationUrl!: string | null;
}
