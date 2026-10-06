export type PublicProfile = { headline: string; summary: string; about: string };
export type ProfileContentUpdate = PublicProfile;

export interface ProfilePersistence {
  findPublic(): Promise<PublicProfile | undefined>;
  updateContent(content: ProfileContentUpdate): Promise<PublicProfile | undefined>;
}

export const PROFILE_PERSISTENCE = Symbol('PROFILE_PERSISTENCE');
