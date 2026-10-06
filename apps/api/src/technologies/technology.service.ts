import { Inject, Injectable } from '@nestjs/common';
import { TECHNOLOGY_PERSISTENCE } from './technology.persistence.js';
import type { TechnologyPersistence } from './technology.persistence.js';
@Injectable()
export class TechnologyService { constructor(@Inject(TECHNOLOGY_PERSISTENCE) private readonly persistence: TechnologyPersistence) {} getTechnologies() { return this.persistence.findPublished(); } }
