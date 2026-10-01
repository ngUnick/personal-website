import { Injectable } from '@nestjs/common';
import { ProjectResponseDto } from './project-response.dto.js';

@Injectable()
export class ProjectsService {
  getProjects(): ProjectResponseDto[] {
    return [{
      slug: 'placeholder-project',
      title: 'Placeholder Project',
      summary: 'Temporary sample content used to validate the application path.',
    }];
  }
}
