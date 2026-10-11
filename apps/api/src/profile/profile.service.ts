import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROFILE_PERSISTENCE } from './profile.persistence.js';
import type {
  ProfileContentUpdate,
  ProfileContactUpdate,
  ProfilePersistence,
  ProfileLinksUpdate,
} from './profile.persistence.js';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(PROFILE_PERSISTENCE)
    private readonly persistence: ProfilePersistence,
  ) {}

  async getProfile() {
    return this.requireProfile();
  }

  async getAdminProfile() {
    return this.requireProfile();
  }

  async updateContent(content: ProfileContentUpdate) {
    const profile = await this.persistence.updateContent(content);
    if (!profile) throw new NotFoundException('Profile not found.');
    return profile;
  }

  async updateContact(contact: ProfileContactUpdate) {
    const profile = await this.persistence.updateContact(contact);
    if (!profile) throw new NotFoundException('Profile not found.');
    return profile;
  }
  async updateLinks(links: ProfileLinksUpdate) {
    const profile = await this.persistence.updateLinks(links);
    if (!profile) throw new NotFoundException('Profile not found.');
    return profile;
  }

  private async requireProfile() {
    const profile = await this.persistence.findPublic();
    if (!profile) throw new NotFoundException('Profile not found.');
    return profile;
  }
}
