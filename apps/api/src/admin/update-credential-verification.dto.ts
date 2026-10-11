import { ApiProperty } from '@nestjs/swagger';

export class UpdateCredentialVerificationDto {
  @ApiProperty({ nullable: true })
  verificationUrl!: string | null;
}
