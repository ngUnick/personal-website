import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { profiles } from '../database/schema.js';
import {
  ProfileContentUpdate,
  ProfileContactUpdate,
  ProfilePersistence,
  ProfileLinksUpdate,
  PublicProfile,
} from './profile.persistence.js';

@Injectable()
export class DrizzleProfilePersistence implements ProfilePersistence {
  constructor(private readonly database: DatabaseService) {}
  async findPublic(): Promise<PublicProfile | undefined> {
    return (
      await this.database.db
        .select(this.projection)
        .from(profiles)
        .where(eq(profiles.id, 1))
        .limit(1)
    )[0];
  }

  async updateContent(
    content: ProfileContentUpdate,
  ): Promise<PublicProfile | undefined> {
    const [profile] = await this.database.db
      .update(profiles)
      .set({ ...content, updatedAt: new Date() })
      .where(eq(profiles.id, 1))
      .returning(this.projection);
    return profile;
  }

  async updateContact(
    contact: ProfileContactUpdate,
  ): Promise<PublicProfile | undefined> {
    const [profile] = await this.database.db
      .update(profiles)
      .set({ ...contact, updatedAt: new Date() })
      .where(eq(profiles.id, 1))
      .returning(this.projection);
    return profile;
  }
  async updateLinks(
    links: ProfileLinksUpdate,
  ): Promise<PublicProfile | undefined> {
    const [profile] = await this.database.db
      .update(profiles)
      .set({ ...links, updatedAt: new Date() })
      .where(eq(profiles.id, 1))
      .returning(this.projection);
    return profile;
  }

  private readonly projection = {
    headline: profiles.headline,
    summary: profiles.summary,
    about: profiles.about,
    contactEmail: profiles.contactEmail,
    githubUrl: profiles.githubUrl,
    linkedinUrl: profiles.linkedinUrl,
  };
}
