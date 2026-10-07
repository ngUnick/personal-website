import { ApiProperty } from '@nestjs/swagger';

export class CreateTechnologyDraftDto {
  @ApiProperty() name!: string;
  @ApiProperty() category!: string;
}
