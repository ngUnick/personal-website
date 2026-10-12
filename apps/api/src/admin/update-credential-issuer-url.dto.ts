import { ApiProperty } from '@nestjs/swagger';

export class UpdateCredentialIssuerUrlDto {
  @ApiProperty({ nullable: true, example: 'https://issuer.example' })
  issuerUrl!: string | null;
}
