export type PublicProfile = { headline: string; summary: string; about: string; contactEmail: string | null };
export type ProfileContentUpdate = Pick<PublicProfile, 'headline' | 'summary' | 'about'>;
export type ProfileContactUpdate = Pick<PublicProfile, 'contactEmail'>;

export interface ProfilePersistence {
  findPublic(): Promise<PublicProfile | undefined>;
  updateContent(content: ProfileContentUpdate): Promise<PublicProfile | undefined>;
  updateContact(contact: ProfileContactUpdate): Promise<PublicProfile | undefined>;
}

export const PROFILE_PERSISTENCE = Symbol('PROFILE_PERSISTENCE');
