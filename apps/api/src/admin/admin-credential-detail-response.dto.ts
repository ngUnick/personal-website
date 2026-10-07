import { ApiProperty } from '@nestjs/swagger';
export class AdminCredentialDetailResponseDto { @ApiProperty() id!: string; @ApiProperty() name!: string; @ApiProperty() issuer!: string; @ApiProperty() issuedOn!: string; @ApiProperty({ enum: ['draft', 'published', 'archived'] }) status!: string; }
