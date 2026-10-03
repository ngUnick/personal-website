import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => app.close());

  it('returns a deterministic health response', () =>
    request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok' }));

  it('returns exactly one explicit placeholder project', () =>
    request(app.getHttpServer())
      .get('/api/projects')
      .expect(200)
      .expect([
        {
          slug: 'placeholder-project',
          title: 'Placeholder Project',
          summary:
            'Temporary sample content used to validate the application path.',
        },
      ]));

  it('returns the featured published placeholder project', () =>
    request(app.getHttpServer())
      .get('/api/projects?featured=true')
      .expect(200)
      .expect([
        {
          slug: 'placeholder-project',
          title: 'Placeholder Project',
          summary:
            'Temporary sample content used to validate the application path.',
        },
      ]));

  it('returns a published project by slug', () =>
    request(app.getHttpServer())
      .get('/api/projects/placeholder-project')
      .expect(200)
      .expect({
        slug: 'placeholder-project',
        title: 'Placeholder Project',
        summary:
          'Temporary sample content used to validate the application path.',
      }));

  it('returns 404 when a project slug is not public', () =>
    request(app.getHttpServer())
      .get('/api/projects/unknown-project')
      .expect(404));
});
