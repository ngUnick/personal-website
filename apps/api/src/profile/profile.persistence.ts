export type PublicProfile = { headline: string; summary: string; about: string };
export interface ProfilePersistence { findPublic(): Promise<PublicProfile | undefined>; }
export const PROFILE_PERSISTENCE = Symbol('PROFILE_PERSISTENCE');
