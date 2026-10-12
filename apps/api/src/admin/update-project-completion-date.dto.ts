import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectCompletionDateDto {
  @ApiProperty({ nullable: true, example: '2025-01-01' })
  completedOn!: string | null;
}
