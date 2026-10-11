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
import { UpdateProfileContactDto } from './update-profile-contact.dto.js';
import { UpdateProfileLinksDto } from './update-profile-links.dto.js';

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

  @Patch('contact')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateProfileContactDto })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  updateContact(@Body() body: UpdateProfileContactDto) {
    return this.profile.updateContact(this.validContact(body));
  }
  @Patch('links')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateProfileLinksDto })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  updateLinks(@Body() body: UpdateProfileLinksDto) {
    return this.profile.updateLinks(this.validLinks(body));
  }
  private validLinks(body: UpdateProfileLinksDto) {
    return {
      githubUrl: this.validUrl(body?.githubUrl),
      linkedinUrl: this.validUrl(body?.linkedinUrl),
    };
  }
  private validUrl(value: unknown) {
    if (value === null) return null;
    if (typeof value !== 'string' || !value.trim())
      throw new BadRequestException(
        'Professional links must be absolute HTTPS URLs or null.',
      );
    try {
      const url = new URL(value.trim());
      if (url.protocol !== 'https:') throw new Error();
      return url.href;
    } catch {
      throw new BadRequestException(
        'Professional links must be absolute HTTPS URLs or null.',
      );
    }
  }

  private validContent(body: UpdateProfileContentDto) {
    const headline =
      typeof body?.headline === 'string' ? body.headline.trim() : '';
    const summary =
      typeof body?.summary === 'string' ? body.summary.trim() : '';
    const about = typeof body?.about === 'string' ? body.about.trim() : '';
    if (!headline || !summary || !about) {
      throw new BadRequestException(
        'Headline, summary, and about content are required.',
      );
    }
    return { headline, summary, about };
  }

  private validContact(body: UpdateProfileContactDto) {
    if (body?.contactEmail === null) return { contactEmail: null };
    const contactEmail =
      typeof body?.contactEmail === 'string' ? body.contactEmail.trim() : '';
    if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      throw new BadRequestException(
        'A valid contact email or null is required.',
      );
    }
    return { contactEmail };
  }
}
