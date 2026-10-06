export type PublicTechnology = { name: string; category: string };
export interface TechnologyPersistence { findPublished(): Promise<PublicTechnology[]>; }
export const TECHNOLOGY_PERSISTENCE = Symbol('TECHNOLOGY_PERSISTENCE');
