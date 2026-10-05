import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash, randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { sessionCookieName } from '../src/admin-auth/admin-auth.service.js';
import { DatabaseService } from '../src/database/database.service.js';
import { adminSessions, projects } from '../src/database/schema.js';

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

  const authenticatedAgent = async () => {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/admin-auth/login')
      .send({ loginIdentifier: 'fake-admin', password: 'development-only-password' })
      .expect(200);
    return agent;
  };

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

  it('returns the deterministic published experience fixture', () =>
    request(app.getHttpServer())
      .get('/api/experience')
      .expect(200)
      .expect([
        {
          organization: 'Example Software Studio',
          role: 'Example Software Engineer',
          summary:
            'Fictional development fixture used to validate the public experience path.',
          startDate: '2024-01-01',
          endDate: null,
        },
      ]));

  it('establishes, reports, and revokes an opaque admin session', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/admin-auth/login')
      .send({
        loginIdentifier: 'fake-admin',
        password: 'development-only-password',
      })
      .expect(200)
      .expect({ authenticated: true });
    await agent
      .get('/api/admin-auth/session')
      .expect(200)
      .expect({ authenticated: true, loginIdentifier: 'fake-admin' });
    await agent
      .post('/api/admin-auth/logout')
      .expect(200)
      .expect({ authenticated: false });
    await agent
      .get('/api/admin-auth/session')
      .expect(200)
      .expect({ authenticated: false });
  });

  it('returns one generic unauthorized response for invalid credentials', () =>
    request(app.getHttpServer())
      .post('/api/admin-auth/login')
      .send({ loginIdentifier: 'unknown', password: 'wrong' })
      .expect(401)
      .expect(({ body }) => {
        expect(body.message).toBe('Invalid credentials.');
      }));

  it('uses explicit secure cookie attributes for a new session', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/admin-auth/login')
      .send({
        loginIdentifier: 'fake-admin',
        password: 'development-only-password',
      })
      .expect(200);
    const cookie = response.headers['set-cookie']?.[0] ?? '';
    expect(cookie).toContain(`${sessionCookieName}=`);
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toMatch(/Max-Age=[1-9]\d*/);
  });

  it('does not authenticate an expired persisted session', async () => {
    const database = app.get(DatabaseService).db;
    const token = 'expired-session-token';
    const id = randomUUID();
    await database.insert(adminSessions).values({
      id,
      tokenHash: createHash('sha256').update(token).digest('base64url'),
      adminUserId: '00000000-0000-4000-8000-000000000020',
      expiresAt: new Date(Date.now() - 1_000),
    });
    try {
      await request(app.getHttpServer())
        .get('/api/admin-auth/session')
        .set('Cookie', `${sessionCookieName}=${token}`)
        .expect(200)
        .expect({ authenticated: false });
    } finally {
      await database.delete(adminSessions).where(eq(adminSessions.id, id));
    }
  });

  it('persists a session token hash instead of the cookie token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/admin-auth/login')
      .send({
        loginIdentifier: 'fake-admin',
        password: 'development-only-password',
      })
      .expect(200);
    const cookie = response.headers['set-cookie']?.[0] ?? '';
    const token = cookie.match(new RegExp(`${sessionCookieName}=([^;]+)`))?.[1];
    if (!token) throw new Error('Expected the login response to set a session cookie.');
    const tokenHash = createHash('sha256').update(token).digest('base64url');
    const database = app.get(DatabaseService).db;
    const [session] = await database
      .select({ id: adminSessions.id, tokenHash: adminSessions.tokenHash })
      .from(adminSessions)
      .where(eq(adminSessions.tokenHash, tokenHash));
    expect(session?.tokenHash).toBe(tokenHash);
    expect(session?.tokenHash).not.toBe(token);
    await database.delete(adminSessions).where(eq(adminSessions.id, session?.id ?? ''));
  });

  it('does not authenticate a malformed session cookie', () =>
    request(app.getHttpServer())
      .get('/api/admin-auth/session')
      .set('Cookie', 'personal_website_admin_session=malformed')
      .expect(200)
      .expect({ authenticated: false }));

  it('returns a published project by slug', () =>
    request(app.getHttpServer())
      .get('/api/projects/placeholder-project')
      .expect(200)
      .expect({
        slug: 'placeholder-project',
        title: 'Placeholder Project',
        summary:
          'Temporary sample content used to validate the application path.',
        caseStudy: 'Fictional narrative used to validate the published project detail path.\n\nIt is deliberately not personal portfolio content.',
      }));

  it('returns 404 when a project slug is not public', () =>
    request(app.getHttpServer())
      .get('/api/projects/unknown-project')
      .expect(404));

  it('keeps private project administration behind an authenticated session', async () => {
    await request(app.getHttpServer()).get('/api/admin/projects').expect(401);
    const agent = await authenticatedAgent();
    await agent.get('/api/admin/projects').expect(200).expect(({ body }) => {
      const [project] = body;
      expect(project).toMatchObject({ slug: 'placeholder-project', status: 'published', featured: true });
      expect(project).not.toHaveProperty('passwordHash');
      expect(project).not.toHaveProperty('tokenHash');
    });
  });

  it('requires a trusted origin and changes only a project featured state', async () => {
    await request(app.getHttpServer()).patch('/api/admin/projects/placeholder-project/featured').send({ featured: false }).expect(401);
    const agent = await authenticatedAgent();
    await agent.patch('/api/admin/projects/placeholder-project/featured').send({ featured: false }).expect(403);
    await agent.patch('/api/admin/projects/placeholder-project/featured').set('Origin', 'https://untrusted.example').send({ featured: false }).expect(403);
    try {
      await agent.patch('/api/admin/projects/placeholder-project/featured').set('Origin', 'http://localhost:4200').send({ featured: false }).expect(200).expect(({ body }) => {
        expect(body).toEqual({ slug: 'placeholder-project', title: 'Placeholder Project', status: 'published', featured: false });
      });
      await request(app.getHttpServer()).get('/api/projects?featured=true').expect(200).expect([]);
    } finally {
      await agent.patch('/api/admin/projects/placeholder-project/featured').set('Origin', 'http://localhost:4200').send({ featured: true }).expect(200);
    }
  });

  it('returns 404 for an authenticated update of an unknown project', async () => {
    const agent = await authenticatedAgent();
    await agent.patch('/api/admin/projects/unknown/featured').set('Origin', 'http://localhost:4200').send({ featured: false }).expect(404);
  });

  it('moves projects through the protected adjacent ordering boundary', async () => {
    const slug = 'draft-placeholder-project';
    await request(app.getHttpServer()).patch(`/api/admin/projects/${slug}/order`).send({ direction: 'up' }).expect(401);
    const agent = await authenticatedAgent();
    await agent.patch(`/api/admin/projects/${slug}/order`).send({ direction: 'up' }).expect(403);
    await agent.patch(`/api/admin/projects/${slug}/order`).set('Origin', 'https://untrusted.example').send({ direction: 'up' }).expect(403);
    await agent.patch(`/api/admin/projects/${slug}/order`).set('Origin', 'http://localhost:4200').send({}).expect(400);
    await agent.patch(`/api/admin/projects/${slug}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'sideways' }).expect(400);
    await agent.patch('/api/admin/projects/unknown/order').set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(404);
    try {
      await agent.patch(`/api/admin/projects/${slug}/status`).set('Origin', 'http://localhost:4200').send({ status: 'published' }).expect(200);
      await agent.patch(`/api/admin/projects/${slug}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(200).expect(({ body }) => {
        expect(body.map((project: { slug: string }) => project.slug).slice(0, 2)).toEqual([slug, 'placeholder-project']);
      });
      await request(app.getHttpServer()).get('/api/projects').expect(200).expect(({ body }) => expect(body.map((project: { slug: string }) => project.slug)).toEqual([slug, 'placeholder-project']));
      await request(app.getHttpServer()).get('/api/projects?featured=true').expect(200).expect(({ body }) => expect(body.map((project: { slug: string }) => project.slug)).toEqual(['placeholder-project']));
      await agent.patch(`/api/admin/projects/${slug}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(200).expect(({ body }) => expect(body.map((project: { slug: string }) => project.slug).slice(0, 2)).toEqual([slug, 'placeholder-project']));
    } finally {
      await agent.patch(`/api/admin/projects/${slug}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'down' }).expect(200);
      await agent.patch(`/api/admin/projects/${slug}/status`).set('Origin', 'http://localhost:4200').send({ status: 'draft' }).expect(200);
    }
  });

  it('keeps draft authoring private and changes only draft content', async () => {
    await request(app.getHttpServer()).get('/api/projects/draft-placeholder-project').expect(404);
    await request(app.getHttpServer()).get('/api/admin/projects/draft-placeholder-project').expect(401);
    await request(app.getHttpServer()).patch('/api/admin/projects/draft-placeholder-project/content').send({ title: 'Changed', summary: 'Changed' }).expect(401);
    const agent = await authenticatedAgent();
    await agent.get('/api/admin/projects/draft-placeholder-project').expect(200).expect(({ body }) => {
      expect(body).toEqual({ slug: 'draft-placeholder-project', title: 'Draft Placeholder Project', summary: 'Fictional draft content used only to validate private project authoring.', caseStudy: 'Fictional draft narrative used only to validate private case-study authoring.', status: 'draft', featured: false });
    });
    await agent.patch('/api/admin/projects/draft-placeholder-project/content').send({ title: '', summary: 'Valid summary', caseStudy: '' }).expect(403);
    await agent.patch('/api/admin/projects/draft-placeholder-project/content').set('Origin', 'http://localhost:4200').send({ title: '', summary: 'Valid summary', caseStudy: '' }).expect(400);
    await agent.patch('/api/admin/projects/draft-placeholder-project/content').set('Origin', 'http://localhost:4200').send({ title: 'Valid title', summary: 'Valid summary' }).expect(400);
    await agent.patch('/api/admin/projects/draft-placeholder-project/content').set('Origin', 'http://localhost:4200').send({ title: 'Valid title', summary: 'Valid summary', caseStudy: 42 }).expect(400);
    try {
      await agent.patch('/api/admin/projects/draft-placeholder-project/content').set('Origin', 'http://localhost:4200').send({ title: 'Edited Draft', summary: 'Edited fictional draft content.', caseStudy: 'Edited fictional narrative.' }).expect(200).expect(({ body }) => {
        expect(body).toEqual({ slug: 'draft-placeholder-project', title: 'Edited Draft', summary: 'Edited fictional draft content.', caseStudy: 'Edited fictional narrative.', status: 'draft', featured: false });
      });
      await request(app.getHttpServer()).get('/api/projects/draft-placeholder-project').expect(404);
    } finally {
      await agent.patch('/api/admin/projects/draft-placeholder-project/content').set('Origin', 'http://localhost:4200').send({ title: 'Draft Placeholder Project', summary: 'Fictional draft content used only to validate private project authoring.', caseStudy: 'Fictional draft narrative used only to validate private case-study authoring.' }).expect(200);
    }
  });

  it('changes publication status through the protected CMS boundary and controls public visibility', async () => {
    const slug = 'draft-placeholder-project';
    await request(app.getHttpServer()).get('/api/projects').expect(200).expect(({ body }) => expect(body.find((project: { slug: string }) => project.slug === slug)).toBeUndefined());
    await request(app.getHttpServer()).patch(`/api/admin/projects/${slug}/status`).send({ status: 'published' }).expect(401);
    const agent = await authenticatedAgent();
    await agent.patch(`/api/admin/projects/${slug}/status`).send({ status: 'published' }).expect(403);
    await agent.patch(`/api/admin/projects/${slug}/status`).set('Origin', 'https://untrusted.example').send({ status: 'published' }).expect(403);
    await agent.patch(`/api/admin/projects/${slug}/status`).set('Origin', 'http://localhost:4200').send({ status: 'invalid' }).expect(400);
    await agent.patch(`/api/admin/projects/${slug}/status`).set('Origin', 'http://localhost:4200').send({}).expect(400);
    await agent.patch('/api/admin/projects/unknown/status').set('Origin', 'http://localhost:4200').send({ status: 'published' }).expect(404);
    try {
      await agent.patch(`/api/admin/projects/${slug}/status`).set('Origin', 'http://localhost:4200').send({ status: 'published' }).expect(200).expect(({ body }) => {
        expect(body).toEqual({ slug, title: 'Draft Placeholder Project', summary: 'Fictional draft content used only to validate private project authoring.', caseStudy: 'Fictional draft narrative used only to validate private case-study authoring.', status: 'published', featured: false });
      });
      await request(app.getHttpServer()).get('/api/projects').expect(200).expect(({ body }) => expect(body.find((project: { slug: string }) => project.slug === slug)).toMatchObject({ slug, title: 'Draft Placeholder Project', summary: 'Fictional draft content used only to validate private project authoring.' }));
      await request(app.getHttpServer()).get(`/api/projects/${slug}`).expect(200).expect(({ body }) => expect(body.slug).toBe(slug));
      await request(app.getHttpServer()).get('/api/projects?featured=true').expect(200).expect([{ slug: 'placeholder-project', title: 'Placeholder Project', summary: 'Temporary sample content used to validate the application path.' }]);
      await agent.patch(`/api/admin/projects/${slug}/status`).set('Origin', 'http://localhost:4200').send({ status: 'archived' }).expect(200).expect(({ body }) => expect(body.status).toBe('archived'));
      await request(app.getHttpServer()).get('/api/projects').expect(200).expect(({ body }) => expect(body.find((project: { slug: string }) => project.slug === slug)).toBeUndefined());
      await request(app.getHttpServer()).get(`/api/projects/${slug}`).expect(404);
    } finally {
      await agent.patch(`/api/admin/projects/${slug}/status`).set('Origin', 'http://localhost:4200').send({ status: 'draft' }).expect(200);
    }
  });

  it('creates a server-owned fictional draft through the protected CMS boundary', async () => {
    const slug = 'fictional-created-project';
    const input = { slug, title: 'Fictional Created Project', summary: 'Fake content used only to validate project creation.' };
    await request(app.getHttpServer()).post('/api/admin/projects').send(input).expect(401);
    const agent = await authenticatedAgent();
    await agent.post('/api/admin/projects').send(input).expect(403);
    await agent.post('/api/admin/projects').set('Origin', 'https://untrusted.example').send(input).expect(403);
    await agent.post('/api/admin/projects').set('Origin', 'http://localhost:4200').send({ title: input.title, summary: input.summary }).expect(400);
    await agent.post('/api/admin/projects').set('Origin', 'http://localhost:4200').send({ ...input, title: '' }).expect(400);
    await agent.post('/api/admin/projects').set('Origin', 'http://localhost:4200').send({ ...input, summary: '' }).expect(400);
    await agent.post('/api/admin/projects').set('Origin', 'http://localhost:4200').send({ ...input, slug: 'Invalid Slug' }).expect(400);
    try {
      await agent.post('/api/admin/projects').set('Origin', 'http://localhost:4200').send({ ...input, status: 'published', featured: true, displayOrder: 0, id: '00000000-0000-4000-8000-000000000099' }).expect(201).expect(({ body }) => {
        expect(body).toEqual({ ...input, caseStudy: '', status: 'draft', featured: false });
      });
      await agent.post('/api/admin/projects').set('Origin', 'http://localhost:4200').send(input).expect(409);
      await agent.get(`/api/admin/projects/${slug}`).expect(200).expect({ ...input, caseStudy: '', status: 'draft', featured: false });
      await request(app.getHttpServer()).get('/api/projects').expect(200).expect(({ body }) => expect(body.find((project: { slug: string }) => project.slug === slug)).toBeUndefined());
      await request(app.getHttpServer()).get('/api/projects?featured=true').expect(200).expect(({ body }) => expect(body.find((project: { slug: string }) => project.slug === slug)).toBeUndefined());
      await request(app.getHttpServer()).get(`/api/projects/${slug}`).expect(404);
    } finally {
      await app.get(DatabaseService).db.delete(projects).where(eq(projects.slug, slug));
    }
  });

  it('keeps Experience draft authoring private and server-owned', async () => {
    const id = '00000000-0000-4000-8000-000000000014';
    const original = { organization: 'Example Draft Studio', role: 'Example Draft Engineer', summary: 'Fictional draft experience used only to validate private CMS authoring.', startDate: '2025-01-01', endDate: null };
    await request(app.getHttpServer()).get('/api/experience').expect(200).expect([{ organization: 'Example Software Studio', role: 'Example Software Engineer', summary: 'Fictional development fixture used to validate the public experience path.', startDate: '2024-01-01', endDate: null }]);
    await request(app.getHttpServer()).get('/api/admin/experience').expect(401);
    await request(app.getHttpServer()).get(`/api/admin/experience/${id}`).expect(401);
    await request(app.getHttpServer()).patch(`/api/admin/experience/${id}/content`).send(original).expect(401);
    const agent = await authenticatedAgent();
    await agent.get('/api/admin/experience/not-a-uuid').expect(400);
    await agent.get('/api/admin/experience/00000000-0000-4000-8000-000000000099').expect(404);
    await agent.patch(`/api/admin/experience/${id}/content`).send(original).expect(403);
    await agent.patch(`/api/admin/experience/${id}/content`).set('Origin', 'https://untrusted.example').send(original).expect(403);
    await agent.patch('/api/admin/experience/not-a-uuid/content').set('Origin', 'http://localhost:4200').send(original).expect(400);
    await agent.patch('/api/admin/experience/00000000-0000-4000-8000-000000000099/content').set('Origin', 'http://localhost:4200').send(original).expect(404);
    await agent.patch(`/api/admin/experience/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...original, organization: undefined }).expect(400);
    await agent.patch(`/api/admin/experience/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...original, organization: 1 }).expect(400);
    await agent.patch(`/api/admin/experience/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...original, role: undefined }).expect(400);
    await agent.patch(`/api/admin/experience/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...original, role: 1 }).expect(400);
    await agent.patch(`/api/admin/experience/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...original, summary: undefined }).expect(400);
    await agent.patch(`/api/admin/experience/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...original, summary: 1 }).expect(400);
    await agent.patch(`/api/admin/experience/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...original, startDate: undefined }).expect(400);
    await agent.patch(`/api/admin/experience/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...original, startDate: 1 }).expect(400);
    await agent.patch(`/api/admin/experience/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...original, endDate: 1 }).expect(400);
    await agent.patch(`/api/admin/experience/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...original, startDate: '2026-02-31' }).expect(400);
    await agent.patch(`/api/admin/experience/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...original, endDate: '2024-12-31' }).expect(400);
    try {
      await agent.get('/api/admin/experience').expect(200).expect(({ body }) => expect(body).toEqual(expect.arrayContaining([expect.objectContaining({ id, status: 'draft' })])));
      await agent.get(`/api/admin/experience/${id}`).expect(200).expect(({ body }) => { expect(body).toEqual({ id, ...original, status: 'draft' }); expect(body).not.toHaveProperty('displayOrder'); expect(body).not.toHaveProperty('createdAt'); expect(body).not.toHaveProperty('updatedAt'); });
      const edited = { organization: 'Edited Draft Studio', role: 'Edited Draft Engineer', summary: 'Edited fictional draft experience.', startDate: '2025-02-01', endDate: '2025-12-31' };
      await agent.patch(`/api/admin/experience/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...edited, id: '00000000-0000-4000-8000-000000000099', status: 'published', displayOrder: 0 }).expect(200).expect(({ body }) => expect(body).toMatchObject({ id, ...edited, status: 'draft' }));
      await request(app.getHttpServer()).get('/api/experience').expect(200).expect(({ body }) => expect(body.find((item: { organization: string }) => item.organization === edited.organization)).toBeUndefined());
    } finally {
      await agent.patch(`/api/admin/experience/${id}/content`).set('Origin', 'http://localhost:4200').send(original).expect(200);
    }
  });

  it('changes Experience publication state through the protected lifecycle', async () => {
    const id = '00000000-0000-4000-8000-000000000014';
    const publicFixture = [{ organization: 'Example Software Studio', role: 'Example Software Engineer', summary: 'Fictional development fixture used to validate the public experience path.', startDate: '2024-01-01', endDate: null }];
    await request(app.getHttpServer()).patch(`/api/admin/experience/${id}/status`).send({ status: 'published' }).expect(401);
    const agent = await authenticatedAgent();
    await agent.patch(`/api/admin/experience/${id}/status`).send({ status: 'published' }).expect(403);
    await agent.patch(`/api/admin/experience/${id}/status`).set('Origin', 'https://untrusted.example').send({ status: 'published' }).expect(403);
    await agent.patch('/api/admin/experience/not-a-uuid/status').set('Origin', 'http://localhost:4200').send({ status: 'published' }).expect(400);
    await agent.patch('/api/admin/experience/00000000-0000-4000-8000-000000000099/status').set('Origin', 'http://localhost:4200').send({ status: 'published' }).expect(404);
    await agent.patch(`/api/admin/experience/${id}/status`).set('Origin', 'http://localhost:4200').send({}).expect(400);
    await agent.patch(`/api/admin/experience/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 'invalid' }).expect(400);
    await agent.patch(`/api/admin/experience/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 1 }).expect(400);
    try {
      await agent.patch(`/api/admin/experience/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 'published' }).expect(200).expect(({ body }) => expect(body).toEqual({ id, organization: 'Example Draft Studio', role: 'Example Draft Engineer', summary: 'Fictional draft experience used only to validate private CMS authoring.', startDate: '2025-01-01', endDate: null, status: 'published' }));
      await request(app.getHttpServer()).get('/api/experience').expect(200).expect(({ body }) => expect(body).toEqual([...publicFixture, { organization: 'Example Draft Studio', role: 'Example Draft Engineer', summary: 'Fictional draft experience used only to validate private CMS authoring.', startDate: '2025-01-01', endDate: null }]));
      await agent.patch(`/api/admin/experience/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 'archived' }).expect(200);
      await request(app.getHttpServer()).get('/api/experience').expect(200).expect(publicFixture);
    } finally {
      await agent.patch(`/api/admin/experience/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 'draft' }).expect(200);
    }
  });
});
