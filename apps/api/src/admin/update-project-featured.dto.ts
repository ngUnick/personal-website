import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectFeaturedDto {
  @ApiProperty({ example: true })
  featured!: boolean;
}
