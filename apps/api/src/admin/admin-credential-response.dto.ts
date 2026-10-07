import { ApiProperty } from '@nestjs/swagger';
export class AdminCredentialResponseDto { @ApiProperty() id!: string; @ApiProperty() name!: string; @ApiProperty() issuer!: string; @ApiProperty({ enum: ['draft', 'published', 'archived'] }) status!: string; }
