import { ApiProperty } from '@nestjs/swagger';
export class UpdateTechnologyContentDto { @ApiProperty() name!: string; @ApiProperty() category!: string; }
