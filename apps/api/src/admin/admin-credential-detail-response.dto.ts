import { ApiProperty } from '@nestjs/swagger';
export class AdminCredentialDetailResponseDto { @ApiProperty() id!: string; @ApiProperty() name!: string; @ApiProperty() issuer!: string; @ApiProperty() issuedOn!: string; @ApiProperty({ nullable: true }) verificationUrl!: string | null; @ApiProperty({ enum: ['draft', 'published', 'archived'] }) status!: string; }
