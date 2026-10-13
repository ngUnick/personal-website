import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectRoleDto {
  @ApiProperty({ nullable: true })
  role!: string | null;
}
