import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileContactDto {
  @ApiProperty({ nullable: true, example: 'portfolio@example.invalid' })
  contactEmail!: string | null;
}
