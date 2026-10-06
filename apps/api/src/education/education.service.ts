import { Inject, Injectable } from '@nestjs/common';
import {
  EDUCATION_PERSISTENCE,
  type EducationPersistence,
  type PublicEducation,
} from './education.persistence.js';

@Injectable()
export class EducationService {
  constructor(
    @Inject(EDUCATION_PERSISTENCE)
    private readonly persistence: EducationPersistence,
  ) {}

  getEducation(): Promise<PublicEducation[]> {
    return this.persistence.findPublished();
  }
}
