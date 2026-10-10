import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CredentialResponseDto } from './credential-response.dto.js';
import { CredentialService } from './credential.service.js';

@ApiTags('credentials')
@Controller('credentials')
export class CredentialController {
  constructor(private readonly credentials: CredentialService) {}

  @Get()
  @ApiOkResponse({ type: CredentialResponseDto, isArray: true })
  getCredentials(): Promise<CredentialResponseDto[]> {
    return this.credentials.getCredentials();
  }
}
