import { ApiProperty } from '@nestjs/swagger';
export class TechnologyResponseDto { @ApiProperty() name!: string; @ApiProperty() category!: string; }
