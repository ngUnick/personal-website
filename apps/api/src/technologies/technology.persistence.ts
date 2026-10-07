export type PublicTechnology = { name: string; category: string };
export type TechnologyStatus = 'draft' | 'published' | 'archived';
export type AdminTechnology = PublicTechnology & { id: string; status: TechnologyStatus; displayOrder: number };
export type TechnologyContentUpdate = PublicTechnology;
export type CreateTechnologyDraft = TechnologyContentUpdate;
export type TechnologyOrderDirection = 'up' | 'down';
export interface TechnologyPersistence { findPublished(): Promise<PublicTechnology[]>; findForAdmin(): Promise<AdminTechnology[]>; findForAdminById(id: string): Promise<AdminTechnology | undefined>; updateContent(id: string, content: TechnologyContentUpdate): Promise<AdminTechnology | undefined>; updateStatus(id: string, status: TechnologyStatus): Promise<AdminTechnology | undefined>; createDraft(input: CreateTechnologyDraft): Promise<AdminTechnology>; moveTechnology(id: string, direction: TechnologyOrderDirection): Promise<AdminTechnology[] | undefined>; }
export const TECHNOLOGY_PERSISTENCE = Symbol('TECHNOLOGY_PERSISTENCE');
