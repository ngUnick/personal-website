import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EDUCATION_PERSISTENCE,
  type EducationPersistence,
  type PublicEducation,
  type AdminPersistedEducation,
  type EducationContentUpdate,
  type CreateEducationDraft,
  type EducationPublicationStatus,
} from './education.persistence.js';

@Injectable()
export class EducationService {
  constructor(
    @Inject(EDUCATION_PERSISTENCE)
    private readonly persistence: EducationPersistence,
  ) {}

  getEducation(): Promise<PublicEducation[]> {
    return this.persistence.findPublished();
  }

  async getAdminEducation(): Promise<
    Pick<
      AdminPersistedEducation,
      'id' | 'institution' | 'qualification' | 'status'
    >[]
  > {
    return (await this.persistence.findForAdmin()).map(
      ({ id, institution, qualification, status }) => ({
        id,
        institution,
        qualification,
        status,
      }),
    );
  }

  async getAdminEducationById(id: string) {
    return this.toAdminDetail(await this.requireAdminEducation(id));
  }

  async updateContent(id: string, content: EducationContentUpdate) {
    const education = await this.persistence.updateContent(id, content);
    if (!education) throw new NotFoundException('Education not found.');
    return this.toAdminDetail(education);
  }

  async updateStatus(id: string, status: EducationPublicationStatus) {
    const education = await this.persistence.updateStatus(id, status);
    if (!education) throw new NotFoundException('Education not found.');
    return this.toAdminDetail(education);
  }

  async createDraft(input: CreateEducationDraft) {
    return this.toAdminDetail(await this.persistence.createDraft(input));
  }

  private async requireAdminEducation(id: string) {
    const education = await this.persistence.findForAdminById(id);
    if (!education) throw new NotFoundException('Education not found.');
    return education;
  }

  private toAdminDetail(education: AdminPersistedEducation) {
    const {
      id,
      institution,
      qualification,
      summary,
      startDate,
      endDate,
      status,
    } = education;
    return {
      id,
      institution,
      qualification,
      summary,
      startDate,
      endDate,
      status,
    };
  }
}
