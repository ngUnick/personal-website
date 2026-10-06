import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileContentDto {
  @ApiProperty()
  headline!: string;

  @ApiProperty()
  summary!: string;

  @ApiProperty()
  about!: string;
}
