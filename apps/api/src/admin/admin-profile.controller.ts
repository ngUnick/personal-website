import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProfileResponseDto } from '../profile/profile-response.dto.js';
import { ProfileService } from '../profile/profile.service.js';
import { AdminSessionGuard } from './admin-session.guard.js';
import { TrustedOriginGuard } from './trusted-origin.guard.js';
import { UpdateProfileContentDto } from './update-profile-content.dto.js';

@ApiTags('admin')
@Controller('admin/profile')
export class AdminProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  @UseGuards(AdminSessionGuard)
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiUnauthorizedResponse()
  getProfile() {
    return this.profile.getAdminProfile();
  }

  @Patch('content')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateProfileContentDto })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  updateContent(@Body() body: UpdateProfileContentDto) {
    return this.profile.updateContent(this.validContent(body));
  }

  private validContent(body: UpdateProfileContentDto) {
    const headline = typeof body?.headline === 'string' ? body.headline.trim() : '';
    const summary = typeof body?.summary === 'string' ? body.summary.trim() : '';
    const about = typeof body?.about === 'string' ? body.about.trim() : '';
    if (!headline || !summary || !about) {
      throw new BadRequestException('Headline, summary, and about content are required.');
    }
    return { headline, summary, about };
  }
}
