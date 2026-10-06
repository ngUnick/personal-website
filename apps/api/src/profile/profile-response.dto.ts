import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty()
  headline!: string;

  @ApiProperty()
  summary!: string;

  @ApiProperty()
  about!: string;
}
