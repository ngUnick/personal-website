import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service.js';
import { ProfileResponseDto } from './profile-response.dto.js';

@ApiTags('profile')
@Controller('profile')
export class ProfileController { constructor(private readonly profile: ProfileService) {} @Get() @ApiOkResponse({ type: ProfileResponseDto }) getProfile() { return this.profile.getProfile(); } }
