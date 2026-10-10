import { ApiProperty } from '@nestjs/swagger';

export class CredentialResponseDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  issuer!: string;

  @ApiProperty({ example: '2025-01-01' })
  issuedOn!: string;
}
