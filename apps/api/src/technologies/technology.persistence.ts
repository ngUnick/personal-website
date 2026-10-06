export type PublicTechnology = { name: string; category: string };
export type TechnologyStatus = 'draft' | 'published' | 'archived';
export type AdminTechnology = PublicTechnology & { id: string; status: TechnologyStatus; displayOrder: number };
export type TechnologyContentUpdate = PublicTechnology;
export interface TechnologyPersistence { findPublished(): Promise<PublicTechnology[]>; findForAdmin(): Promise<AdminTechnology[]>; findForAdminById(id: string): Promise<AdminTechnology | undefined>; updateContent(id: string, content: TechnologyContentUpdate): Promise<AdminTechnology | undefined>; }
export const TECHNOLOGY_PERSISTENCE = Symbol('TECHNOLOGY_PERSISTENCE');
