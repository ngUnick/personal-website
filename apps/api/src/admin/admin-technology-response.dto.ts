import { ApiProperty } from '@nestjs/swagger';
export class AdminTechnologyResponseDto { @ApiProperty() id!: string; @ApiProperty() name!: string; @ApiProperty() category!: string; @ApiProperty({ enum: ['draft', 'published', 'archived'] }) status!: string; }
