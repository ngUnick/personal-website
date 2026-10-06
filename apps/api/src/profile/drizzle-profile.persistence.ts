import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { profiles } from '../database/schema.js';
import {
  ProfileContentUpdate,
  ProfilePersistence,
  PublicProfile,
} from './profile.persistence.js';

@Injectable()
export class DrizzleProfilePersistence implements ProfilePersistence {
  constructor(private readonly database: DatabaseService) {}
  async findPublic(): Promise<PublicProfile | undefined> {
    return (await this.database.db.select({ headline: profiles.headline, summary: profiles.summary, about: profiles.about }).from(profiles).where(eq(profiles.id, 1)).limit(1))[0];
  }

  async updateContent(
    content: ProfileContentUpdate,
  ): Promise<PublicProfile | undefined> {
    const [profile] = await this.database.db
      .update(profiles)
      .set({ ...content, updatedAt: new Date() })
      .where(eq(profiles.id, 1))
      .returning({
        headline: profiles.headline,
        summary: profiles.summary,
        about: profiles.about,
      });
    return profile;
  }
}
