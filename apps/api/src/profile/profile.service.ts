import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROFILE_PERSISTENCE } from './profile.persistence.js';
import type { ProfilePersistence } from './profile.persistence.js';

@Injectable()
export class ProfileService {
  constructor(@Inject(PROFILE_PERSISTENCE) private readonly persistence: ProfilePersistence) {}
  async getProfile() { const profile = await this.persistence.findPublic(); if (!profile) throw new NotFoundException('Profile not found.'); return profile; }
}
