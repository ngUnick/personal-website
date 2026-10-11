import { ApiProperty } from '@nestjs/swagger';

export class UpdateExperienceFeaturedDto {
  @ApiProperty() featured!: boolean;
}
