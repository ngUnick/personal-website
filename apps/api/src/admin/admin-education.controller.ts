import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EducationService } from '../education/education.service.js';
import { AdminSessionGuard } from './admin-session.guard.js';
import { AdminEducationDetailResponseDto } from './admin-education-detail-response.dto.js';
import { AdminEducationResponseDto } from './admin-education-response.dto.js';
import { TrustedOriginGuard } from './trusted-origin.guard.js';
import { UpdateEducationContentDto } from './update-education-content.dto.js';
import { UpdateEducationStatusDto } from './update-education-status.dto.js';
import { UpdateEducationOrderDto } from './update-education-order.dto.js';
import { CreateEducationDraftDto } from './create-education-draft.dto.js';

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

@ApiTags('admin')
@Controller('admin/education')
export class AdminEducationController {
  constructor(private readonly education: EducationService) {}

  @Get()
  @UseGuards(AdminSessionGuard)
  @ApiOkResponse({ type: AdminEducationResponseDto, isArray: true })
  @ApiUnauthorizedResponse()
  list() {
    return this.education.getAdminEducation();
  }

  @Post()
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: CreateEducationDraftDto })
  @ApiCreatedResponse({ type: AdminEducationDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  createDraft(@Body() body: CreateEducationDraftDto) {
    return this.education.createDraft(this.validContent(body));
  }

  @Get(':id')
  @UseGuards(AdminSessionGuard)
  @ApiOkResponse({ type: AdminEducationDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  detail(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.education.getAdminEducationById(id);
  }

  @Patch(':id/content')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateEducationContentDto })
  @ApiOkResponse({ type: AdminEducationDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  updateContent(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: UpdateEducationContentDto,
  ) {
    return this.education.updateContent(id, this.validContent(body));
  }

  @Patch(':id/status')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateEducationStatusDto })
  @ApiOkResponse({ type: AdminEducationDetailResponseDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  updateStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: UpdateEducationStatusDto,
  ) {
    const status = body?.status;
    if (!['draft', 'published', 'archived'].includes(status))
      throw new BadRequestException(
        'A valid education publication status is required.',
      );
    return this.education.updateStatus(id, status);
  }

  @Patch(':id/order')
  @UseGuards(AdminSessionGuard, TrustedOriginGuard)
  @ApiBody({ type: UpdateEducationOrderDto })
  @ApiOkResponse({ type: AdminEducationResponseDto, isArray: true })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  updateOrder(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: UpdateEducationOrderDto,
  ) {
    const direction = body?.direction;
    if (direction !== 'up' && direction !== 'down')
      throw new BadRequestException('A valid education order direction is required.');
    return this.education.moveEducation(id, direction);
  }

  private validContent(body: UpdateEducationContentDto | CreateEducationDraftDto) {
    const institution =
      typeof body?.institution === 'string' ? body.institution.trim() : '';
    const qualification =
      typeof body?.qualification === 'string' ? body.qualification.trim() : '';
    const summary =
      typeof body?.summary === 'string' ? body.summary.trim() : '';
    const startDate = typeof body?.startDate === 'string' ? body.startDate : '';
    const endDate =
      body?.endDate === null
        ? null
        : typeof body?.endDate === 'string'
          ? body.endDate
          : undefined;
    if (
      !institution ||
      !qualification ||
      !summary ||
      !isCalendarDate(startDate) ||
      (endDate !== null && (!endDate || !isCalendarDate(endDate))) ||
      (endDate !== null && endDate < startDate)
    )
      throw new BadRequestException(
        'Valid education content and chronological calendar dates are required.',
      );
    return { institution, qualification, summary, startDate, endDate };
  }
}
