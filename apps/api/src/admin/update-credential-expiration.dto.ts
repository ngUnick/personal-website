import { ApiProperty } from '@nestjs/swagger';

export class UpdateCredentialExpirationDto {
  @ApiProperty({ nullable: true, example: '2027-01-01' })
  expiresOn!: string | null;
}
