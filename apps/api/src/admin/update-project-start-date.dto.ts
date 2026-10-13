import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectStartDateDto {
  @ApiProperty({ nullable: true, example: '2024-01-01' })
  startedOn!: string | null;
}
