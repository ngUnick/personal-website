import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ExperienceResponseDto } from './experience-response.dto.js';
import { EXPERIENCE_PERSISTENCE } from './experience.persistence.js';
import type { ExperienceContentUpdate, ExperiencePersistence, AdminPersistedExperience, ExperiencePublicationStatus, CreateExperienceDraft, ExperienceOrderDirection } from './experience.persistence.js';

export type AdminExperience = Pick<AdminPersistedExperience, 'id' | 'organization' | 'role' | 'status' | 'featured'>;
export type AdminExperienceDetail = Omit<AdminPersistedExperience, 'displayOrder'>;

@Injectable()
export class ExperienceService {
  constructor(
    @Inject(EXPERIENCE_PERSISTENCE)
    private readonly experiencePersistence: ExperiencePersistence,
  ) {}

  async getExperience(): Promise<ExperienceResponseDto[]> {
    return this.experiencePersistence.findPublished();
  }

  async getFeaturedExperience(): Promise<ExperienceResponseDto[]> { return this.experiencePersistence.findFeaturedPublished(); }

  async getAdminExperiences(): Promise<AdminExperience[]> {
    return (await this.experiencePersistence.findForAdmin()).map(({ id, organization, role, status, featured }) => ({ id, organization, role, status, featured }));
  }

  async getAdminExperience(id: string): Promise<AdminExperienceDetail> {
    const experience = await this.experiencePersistence.findForAdminById(id);
    if (!experience) throw new NotFoundException('Experience not found.');
    return this.toAdminDetail(experience);
  }

  async updateContent(id: string, content: ExperienceContentUpdate): Promise<AdminExperienceDetail> {
    const experience = await this.experiencePersistence.updateContent(id, content);
    if (!experience) throw new NotFoundException('Experience not found.');
    return this.toAdminDetail(experience);
  }

  async updateStatus(id: string, status: ExperiencePublicationStatus): Promise<AdminExperienceDetail> {
    const experience = await this.experiencePersistence.updateStatus(id, status);
    if (!experience) throw new NotFoundException('Experience not found.');
    return this.toAdminDetail(experience);
  }
  async updateFeatured(id: string, featured: boolean): Promise<AdminExperienceDetail> { const experience = await this.experiencePersistence.updateFeatured(id, featured); if (!experience) throw new NotFoundException('Experience not found.'); return this.toAdminDetail(experience); }

  async updateLocation(id: string, location: string | null): Promise<AdminExperienceDetail> {
    const experience = await this.experiencePersistence.updateLocation(id, location);
    if (!experience) throw new NotFoundException('Experience not found.');
    return this.toAdminDetail(experience);
  }

  async updateOrganizationUrl(id: string, organizationUrl: string | null): Promise<AdminExperienceDetail> {
    const experience = await this.experiencePersistence.updateOrganizationUrl(id, organizationUrl);
    if (!experience) throw new NotFoundException('Experience not found.');
    return this.toAdminDetail(experience);
  }

  async updateTechnologies(id: string, technologyIds: string[]): Promise<AdminExperienceDetail> {
    const experience = await this.experiencePersistence.updateTechnologies(id, { technologyIds });
    if (!experience) throw new NotFoundException('Experience not found.');
    return this.toAdminDetail(experience);
  }

  async createDraft(input: CreateExperienceDraft): Promise<AdminExperienceDetail> {
    return this.toAdminDetail(await this.experiencePersistence.createDraft(input));
  }

  async deleteDraft(id: string): Promise<void> {
    const experience = await this.experiencePersistence.findForAdminById(id);
    if (!experience) throw new NotFoundException('Experience not found.');
    if (experience.status !== 'draft') throw new ConflictException('Only Draft experiences can be deleted.');
    if (!await this.experiencePersistence.deleteDraft(id)) throw new NotFoundException('Experience not found.');
  }

  async moveExperience(id: string, direction: ExperienceOrderDirection): Promise<AdminExperience[]> {
    const experiences = await this.experiencePersistence.moveExperience(id, direction);
    if (!experiences) throw new NotFoundException('Experience not found.');
    return experiences.map(({ id, organization, role, status, featured }) => ({ id, organization, role, status, featured }));
  }

  private toAdminDetail(experience: AdminPersistedExperience): AdminExperienceDetail {
    const { id, organization, role, summary, location, organizationUrl, startDate, endDate, status, featured, technologyIds } = experience;
    return { id, organization, role, summary, location, organizationUrl, startDate, endDate, status, featured, technologyIds: technologyIds ?? [] };
  }
}
