import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash, randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { sessionCookieName } from '../src/admin-auth/admin-auth.service.js';
import { DatabaseService } from '../src/database/database.service.js';
import { adminSessions, credentials, educations, experiences, profiles, projects, technologies } from '../src/database/schema.js';

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

  it('returns exactly the published fictional education projection', () =>
    request(app.getHttpServer()).get('/api/education').expect(200).expect([{ institution: 'Example Technical Institute', qualification: 'Example Software Engineering Diploma', summary: 'Fictional education fixture used to validate the public homepage path.', startDate: '2020-01-01', endDate: '2023-01-01' }]));

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

  it('returns exactly the fictional public Profile projection', () =>
    request(app.getHttpServer()).get('/api/profile').expect(200).expect({ headline: 'Example Software Engineer', summary: 'Fictional profile summary used to validate the public home path.', about: 'Fictional profile about text used to validate the public about path.' }));

  it('keeps Credential review and editing private and content-only', async () => {
    const id = '00000000-0000-4000-8000-000000000050';
    const original = { name: 'Example Draft Credential', issuer: 'Example Learning Provider', issuedOn: '2025-01-01' };
    await request(app.getHttpServer()).get('/api/admin/credentials').expect(401);
    await request(app.getHttpServer()).get(`/api/admin/credentials/${id}`).expect(401);
    await request(app.getHttpServer()).patch(`/api/admin/credentials/${id}/content`).send(original).expect(401);
    const agent = await authenticatedAgent();
    await agent.get('/api/admin/credentials/not-a-uuid').expect(400);
    await agent.get('/api/admin/credentials/00000000-0000-4000-8000-000000000099').expect(404);
    await agent.patch(`/api/admin/credentials/${id}/content`).send(original).expect(403);
    await agent.patch(`/api/admin/credentials/${id}/content`).set('Origin', 'https://untrusted.example').send(original).expect(403);
    await agent.patch(`/api/admin/credentials/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...original, issuedOn: '2025-02-30' }).expect(400);
    await agent.patch('/api/admin/credentials/00000000-0000-4000-8000-000000000099/content').set('Origin', 'http://localhost:4200').send(original).expect(404);
    const edited = { name: 'Edited Draft Credential', issuer: 'Edited Learning Provider', issuedOn: '2025-02-01' };
    try {
      await agent.get('/api/admin/credentials').expect(200).expect([{ id, name: original.name, issuer: original.issuer, status: 'draft' }]);
      await agent.get(`/api/admin/credentials/${id}`).expect(200).expect({ id, ...original, status: 'draft' });
      await agent.patch(`/api/admin/credentials/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...edited, status: 'published', displayOrder: 99, createdAt: 'never', updatedAt: 'never' }).expect(200).expect({ id, ...edited, status: 'draft' });
      const [stored] = await app.get(DatabaseService).db.select().from(credentials);
      expect(stored).toMatchObject({ id, ...edited, status: 'draft', displayOrder: 0 });
    } finally {
      await agent.patch(`/api/admin/credentials/${id}/content`).set('Origin', 'http://localhost:4200').send(original).expect(200);
    }
  });

  it('keeps singleton Profile authoring private, exact, and reflected publicly', async () => {
    const original = { headline: 'Example Software Engineer', summary: 'Fictional profile summary used to validate the public home path.', about: 'Fictional profile about text used to validate the public about path.' };
    await request(app.getHttpServer()).get('/api/admin/profile').expect(401);
    await request(app.getHttpServer()).patch('/api/admin/profile/content').send(original).expect(401);
    const agent = await authenticatedAgent();
    await agent.get('/api/admin/profile').expect(200).expect(original);
    await agent.patch('/api/admin/profile/content').send(original).expect(403);
    await agent.patch('/api/admin/profile/content').set('Origin', 'https://untrusted.example').send(original).expect(403);
    await agent.patch('/api/admin/profile/content').set('Origin', 'http://localhost:4200').send({ ...original, headline: '   ' }).expect(400);
    await agent.patch('/api/admin/profile/content').set('Origin', 'http://localhost:4200').send({ ...original, summary: 1 }).expect(400);
    await agent.patch('/api/admin/profile/content').set('Origin', 'http://localhost:4200').send({ ...original, about: undefined }).expect(400);
    const expected = { headline: 'Edited fictional headline', summary: 'Edited fictional profile summary', about: 'Edited fictional profile about text' };
    try {
      await agent.patch('/api/admin/profile/content').set('Origin', 'http://localhost:4200').send({ headline: ` ${expected.headline} `, summary: ` ${expected.summary} `, about: ` ${expected.about} `, id: 99, createdAt: 'never', updatedAt: 'never' }).expect(200).expect(expected);
      await agent.get('/api/admin/profile').expect(200).expect(expected);
      await request(app.getHttpServer()).get('/api/profile').expect(200).expect(expected);
      const [stored] = await app.get(DatabaseService).db.select().from(profiles);
      expect(stored.id).toBe(1);
      expect(stored).toMatchObject(expected);
    } finally {
      await agent.patch('/api/admin/profile/content').set('Origin', 'http://localhost:4200').send(original).expect(200);
    }
  });

  it('returns only the ordered published fictional Technology projection', () =>
    request(app.getHttpServer()).get('/api/technologies').expect(200).expect([
      { name: 'Example TypeScript', category: 'Languages' },
      { name: 'Example PostgreSQL', category: 'Data' },
    ]));

  it('returns only the ordered published fictional Technology projection', () =>
    request(app.getHttpServer()).get('/api/technologies').expect(200).expect([
      { name: 'Example TypeScript', category: 'Languages' },
      { name: 'Example PostgreSQL', category: 'Data' },
    ]));

  it('keeps draft Technology review and editing private', async () => {
    const id = '00000000-0000-4000-8000-000000000042';
    const original = { id, name: 'Example Draft Tool', category: 'Tools', status: 'draft' };
    await request(app.getHttpServer()).get('/api/admin/technologies').expect(401);
    await request(app.getHttpServer()).patch(`/api/admin/technologies/${id}/content`).send({ name: 'Edited', category: 'Tools' }).expect(401);
    const agent = await authenticatedAgent();
    await agent.get('/api/admin/technologies/00000000-0000-4000-8000-000000000099').expect(404);
    await agent.patch('/api/admin/technologies/00000000-0000-4000-8000-000000000099/content').set('Origin', 'http://localhost:4200').send({ name: 'Missing', category: 'Missing' }).expect(404);
    await agent.patch(`/api/admin/technologies/${id}/content`).send({ name: 'Edited', category: 'Tools' }).expect(403);
    await agent.patch('/api/admin/technologies/not-a-uuid/content').set('Origin', 'http://localhost:4200').send({ name: 'Edited', category: 'Tools' }).expect(400);
    await agent.patch(`/api/admin/technologies/${id}/content`).set('Origin', 'http://localhost:4200').send({ name: ' ', category: 'Tools' }).expect(400);
    try {
      await agent.get('/api/admin/technologies').expect(200).expect([{ id: '00000000-0000-4000-8000-000000000040', name: 'Example TypeScript', category: 'Languages', status: 'published' }, { id: '00000000-0000-4000-8000-000000000041', name: 'Example PostgreSQL', category: 'Data', status: 'published' }, original]);
      await agent.get(`/api/admin/technologies/${id}`).expect(200).expect(original);
      await agent.patch(`/api/admin/technologies/${id}/content`).set('Origin', 'http://localhost:4200').send({ name: ' Edited Draft Tool ', category: ' Edited Tools ', status: 'published', displayOrder: 0 }).expect(200).expect({ id, name: 'Edited Draft Tool', category: 'Edited Tools', status: 'draft' });
      await request(app.getHttpServer()).get('/api/technologies').expect(200).expect([{ name: 'Example TypeScript', category: 'Languages' }, { name: 'Example PostgreSQL', category: 'Data' }]);
    } finally { await agent.patch(`/api/admin/technologies/${id}/content`).set('Origin', 'http://localhost:4200').send({ name: original.name, category: original.category }).expect(200); }
  });

  it('uses an explicit private Technology publication lifecycle', async () => {
    const id = '00000000-0000-4000-8000-000000000042';
    const original = { id, name: 'Example Draft Tool', category: 'Tools', status: 'draft' };
    await request(app.getHttpServer()).patch(`/api/admin/technologies/${id}/status`).send({ status: 'published' }).expect(401);
    const agent = await authenticatedAgent();
    await agent.patch(`/api/admin/technologies/${id}/status`).send({ status: 'published' }).expect(403);
    await agent.patch(`/api/admin/technologies/${id}/status`).set('Origin', 'https://untrusted.example').send({ status: 'published' }).expect(403);
    await agent.patch('/api/admin/technologies/not-a-uuid/status').set('Origin', 'http://localhost:4200').send({ status: 'published' }).expect(400);
    await agent.patch(`/api/admin/technologies/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 'invalid' }).expect(400);
    await agent.patch('/api/admin/technologies/00000000-0000-4000-8000-000000000099/status').set('Origin', 'http://localhost:4200').send({ status: 'published' }).expect(404);
    try {
      await agent.patch(`/api/admin/technologies/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 'published', name: 'Ignored' }).expect(200).expect({ ...original, status: 'published' });
      await request(app.getHttpServer()).get('/api/technologies').expect(200).expect([{ name: 'Example TypeScript', category: 'Languages' }, { name: 'Example PostgreSQL', category: 'Data' }, { name: original.name, category: original.category }]);
      await agent.patch(`/api/admin/technologies/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 'archived' }).expect(200).expect({ ...original, status: 'archived' });
      await request(app.getHttpServer()).get('/api/technologies').expect(200).expect([{ name: 'Example TypeScript', category: 'Languages' }, { name: 'Example PostgreSQL', category: 'Data' }]);
    } finally { await agent.patch(`/api/admin/technologies/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: original.status }).expect(200); }
  });

  it('creates a private Technology Draft with server-owned lifecycle fields', async () => {
    await request(app.getHttpServer()).post('/api/admin/technologies').send({ name: 'Created', category: 'Testing' }).expect(401);
    const agent = await authenticatedAgent();
    await agent.post('/api/admin/technologies').send({ name: 'Created', category: 'Testing' }).expect(403);
    await agent.post('/api/admin/technologies').set('Origin', 'https://untrusted.example').send({ name: 'Created', category: 'Testing' }).expect(403);
    await agent.post('/api/admin/technologies').set('Origin', 'http://localhost:4200').send({ name: ' ', category: 'Testing' }).expect(400);
    let created: { id: string; name: string; category: string; status: string } | undefined;
    try {
      const response = await agent.post('/api/admin/technologies').set('Origin', 'http://localhost:4200').send({ name: ' Created Technology ', category: ' Testing ', status: 'published', displayOrder: 0 }).expect(201);
      created = response.body;
      expect(created).toEqual({ id: expect.stringMatching(/^[0-9a-f-]{36}$/), name: 'Created Technology', category: 'Testing', status: 'draft' });
      await request(app.getHttpServer()).get('/api/technologies').expect(200).expect([{ name: 'Example TypeScript', category: 'Languages' }, { name: 'Example PostgreSQL', category: 'Data' }]);
    } finally { if (created) await app.get(DatabaseService).db.delete(technologies).where(eq(technologies.id, created.id)); }
  });

  it('moves Technologies through a protected adjacent global order', async () => {
    const first = '00000000-0000-4000-8000-000000000040';
    const second = '00000000-0000-4000-8000-000000000041';
    await request(app.getHttpServer()).patch(`/api/admin/technologies/${second}/order`).send({ direction: 'up' }).expect(401);
    const agent = await authenticatedAgent();
    await agent.patch(`/api/admin/technologies/${second}/order`).send({ direction: 'up' }).expect(403);
    await agent.patch(`/api/admin/technologies/${second}/order`).set('Origin', 'https://untrusted.example').send({ direction: 'up' }).expect(403);
    await agent.patch(`/api/admin/technologies/${second}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'sideways' }).expect(400);
    await agent.patch('/api/admin/technologies/00000000-0000-4000-8000-000000000099/order').set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(404);
    try {
      await agent.patch(`/api/admin/technologies/${second}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(200).expect([{ id: second, name: 'Example PostgreSQL', category: 'Data', status: 'published' }, { id: first, name: 'Example TypeScript', category: 'Languages', status: 'published' }, { id: '00000000-0000-4000-8000-000000000042', name: 'Example Draft Tool', category: 'Tools', status: 'draft' }]);
      await request(app.getHttpServer()).get('/api/technologies').expect(200).expect([{ name: 'Example PostgreSQL', category: 'Data' }, { name: 'Example TypeScript', category: 'Languages' }]);
      await agent.patch(`/api/admin/technologies/${second}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(200);
      await agent.patch(`/api/admin/technologies/${first}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(200);
      await agent.patch(`/api/admin/technologies/00000000-0000-4000-8000-000000000042/order`).set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(200).expect([{ id: first, name: 'Example TypeScript', category: 'Languages', status: 'published' }, { id: '00000000-0000-4000-8000-000000000042', name: 'Example Draft Tool', category: 'Tools', status: 'draft' }, { id: second, name: 'Example PostgreSQL', category: 'Data', status: 'published' }]);
      await request(app.getHttpServer()).get('/api/technologies').expect(200).expect([{ name: 'Example TypeScript', category: 'Languages' }, { name: 'Example PostgreSQL', category: 'Data' }]);
      await agent.patch('/api/admin/technologies/00000000-0000-4000-8000-000000000042/order').set('Origin', 'http://localhost:4200').send({ direction: 'down' }).expect(200);
    } finally { await agent.patch(`/api/admin/technologies/${first}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(200); }
  });

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

  it('moves Experience through the protected adjacent ordering boundary', async () => {
    const id = '00000000-0000-4000-8000-000000000014';
    await request(app.getHttpServer()).patch(`/api/admin/experience/${id}/order`).send({ direction: 'up' }).expect(401);
    const agent = await authenticatedAgent();
    await agent.patch(`/api/admin/experience/${id}/order`).send({ direction: 'up' }).expect(403);
    await agent.patch(`/api/admin/experience/${id}/order`).set('Origin', 'https://untrusted.example').send({ direction: 'up' }).expect(403);
    await agent.patch('/api/admin/experience/not-a-uuid/order').set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(400);
    await agent.patch('/api/admin/experience/00000000-0000-4000-8000-000000000099/order').set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(404);
    await agent.patch(`/api/admin/experience/${id}/order`).set('Origin', 'http://localhost:4200').send({}).expect(400);
    await agent.patch(`/api/admin/experience/${id}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'sideways' }).expect(400);
    await agent.patch(`/api/admin/experience/${id}/order`).set('Origin', 'http://localhost:4200').send({ direction: 1 }).expect(400);
    try {
      await agent.patch(`/api/admin/experience/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 'published' }).expect(200);
      await agent.patch(`/api/admin/experience/${id}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(200).expect(({ body }) => { expect(body).toEqual([{ id, organization: 'Example Draft Studio', role: 'Example Draft Engineer', status: 'published' }, { id: '00000000-0000-4000-8000-000000000010', organization: 'Example Software Studio', role: 'Example Software Engineer', status: 'published' }]); expect(body[0]).not.toHaveProperty('displayOrder'); expect(body[0]).not.toHaveProperty('summary'); expect(body[0]).not.toHaveProperty('startDate'); expect(body[0]).not.toHaveProperty('updatedAt'); });
      await request(app.getHttpServer()).get('/api/experience').expect(200).expect(({ body }) => expect(body.map((item: { organization: string }) => item.organization)).toEqual(['Example Draft Studio', 'Example Software Studio']));
      await agent.patch(`/api/admin/experience/${id}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(200).expect(({ body }) => expect(body.map((item: { id: string }) => item.id)).toEqual([id, '00000000-0000-4000-8000-000000000010']));
    } finally {
      await agent.patch(`/api/admin/experience/${id}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'down' }).expect(200);
      await agent.patch(`/api/admin/experience/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 'draft' }).expect(200);
    }
  });

  it('creates a server-owned Experience draft through the protected CMS boundary', async () => {
    const input = { organization: 'Temporary API Creation Studio', role: 'Temporary API Engineer', summary: 'Fictional content used only to validate Experience creation.', startDate: '2026-01-01', endDate: null };
    await request(app.getHttpServer()).post('/api/admin/experience').send(input).expect(401);
    const agent = await authenticatedAgent();
    await agent.post('/api/admin/experience').send(input).expect(403);
    await agent.post('/api/admin/experience').set('Origin', 'https://untrusted.example').send(input).expect(403);
    await agent.post('/api/admin/experience').set('Origin', 'http://localhost:4200').send({ ...input, organization: undefined }).expect(400);
    await agent.post('/api/admin/experience').set('Origin', 'http://localhost:4200').send({ ...input, organization: 1 }).expect(400);
    await agent.post('/api/admin/experience').set('Origin', 'http://localhost:4200').send({ ...input, role: undefined }).expect(400);
    await agent.post('/api/admin/experience').set('Origin', 'http://localhost:4200').send({ ...input, role: 1 }).expect(400);
    await agent.post('/api/admin/experience').set('Origin', 'http://localhost:4200').send({ ...input, summary: undefined }).expect(400);
    await agent.post('/api/admin/experience').set('Origin', 'http://localhost:4200').send({ ...input, summary: 1 }).expect(400);
    await agent.post('/api/admin/experience').set('Origin', 'http://localhost:4200').send({ ...input, startDate: undefined }).expect(400);
    await agent.post('/api/admin/experience').set('Origin', 'http://localhost:4200').send({ ...input, startDate: 1 }).expect(400);
    await agent.post('/api/admin/experience').set('Origin', 'http://localhost:4200').send({ ...input, endDate: 1 }).expect(400);
    await agent.post('/api/admin/experience').set('Origin', 'http://localhost:4200').send({ ...input, startDate: '2026-02-31' }).expect(400);
    await agent.post('/api/admin/experience').set('Origin', 'http://localhost:4200').send({ ...input, endDate: '2025-12-31' }).expect(400);
    let id = '';
    try {
      await agent.post('/api/admin/experience').set('Origin', 'http://localhost:4200').send({ ...input, id: '00000000-0000-4000-8000-000000000099', status: 'published', displayOrder: 0 }).expect(201).expect(({ body }) => { id = body.id; expect(body).toEqual({ id: expect.any(String), ...input, status: 'draft' }); expect(id).not.toBe('00000000-0000-4000-8000-000000000099'); });
      await agent.get(`/api/admin/experience/${id}`).expect(200).expect({ id, ...input, status: 'draft' });
      await agent.get('/api/admin/experience').expect(200).expect(({ body }) => expect(body).toContainEqual({ id, organization: input.organization, role: input.role, status: 'draft' }));
      await request(app.getHttpServer()).get('/api/experience').expect(200).expect(({ body }) => expect(body).not.toContainEqual(expect.objectContaining({ organization: input.organization })));
    } finally { if (id) await app.get(DatabaseService).db.delete(experiences).where(eq(experiences.id, id)); }
  });
  it('keeps Education draft authoring private and server-owned', async () => {
    const id = '00000000-0000-4000-8000-000000000034';
    const original = { institution: 'Example Draft Institute', qualification: 'Example Draft Software Program', summary: 'Fictional draft education used only to validate private CMS authoring.', startDate: '2024-01-01', endDate: null };
    const publicFixture = [{ institution: 'Example Technical Institute', qualification: 'Example Software Engineering Diploma', summary: 'Fictional education fixture used to validate the public homepage path.', startDate: '2020-01-01', endDate: '2023-01-01' }];
    await request(app.getHttpServer()).get('/api/admin/education').expect(401);
    const agent = await authenticatedAgent();
    await agent.patch(`/api/admin/education/${id}/content`).send(original).expect(403);
    await agent.patch(`/api/admin/education/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...original, startDate: 1 }).expect(400);
    try {
      await agent.get('/api/admin/education').expect(200).expect([
        { id: '00000000-0000-4000-8000-000000000030', institution: 'Example Technical Institute', qualification: 'Example Software Engineering Diploma', status: 'published' },
        { id, institution: original.institution, qualification: original.qualification, status: 'draft' },
      ]);
      await agent.get(`/api/admin/education/${id}`).expect(200).expect({ id, ...original, status: 'draft' });
      const edited = { institution: 'Edited Draft Institute', qualification: 'Edited Draft Program', summary: 'Edited fictional draft education.', startDate: '2024-02-01', endDate: '2024-12-31' };
      await agent.patch(`/api/admin/education/${id}/content`).set('Origin', 'http://localhost:4200').send({ ...edited, status: 'published', displayOrder: 0 }).expect(200).expect({ id, ...edited, status: 'draft' });
      await request(app.getHttpServer()).get('/api/education').expect(200).expect(publicFixture);
    } finally {
      await agent.patch(`/api/admin/education/${id}/content`).set('Origin', 'http://localhost:4200').send(original).expect(200);
    }
  });

  it('changes Education publication state through the protected lifecycle', async () => {
    const id = '00000000-0000-4000-8000-000000000034';
    const publicFixture = [{ institution: 'Example Technical Institute', qualification: 'Example Software Engineering Diploma', summary: 'Fictional education fixture used to validate the public homepage path.', startDate: '2020-01-01', endDate: '2023-01-01' }];
    const publishedDraft = { institution: 'Example Draft Institute', qualification: 'Example Draft Software Program', summary: 'Fictional draft education used only to validate private CMS authoring.', startDate: '2024-01-01', endDate: null };
    await request(app.getHttpServer()).patch(`/api/admin/education/${id}/status`).send({ status: 'published' }).expect(401);
    const agent = await authenticatedAgent();
    await agent.patch(`/api/admin/education/${id}/status`).send({ status: 'published' }).expect(403);
    await agent.patch(`/api/admin/education/${id}/status`).set('Origin', 'https://untrusted.example').send({ status: 'published' }).expect(403);
    await agent.patch('/api/admin/education/not-a-uuid/status').set('Origin', 'http://localhost:4200').send({ status: 'published' }).expect(400);
    await agent.patch('/api/admin/education/00000000-0000-4000-8000-000000000099/status').set('Origin', 'http://localhost:4200').send({ status: 'published' }).expect(404);
    await agent.patch(`/api/admin/education/${id}/status`).set('Origin', 'http://localhost:4200').send({}).expect(400);
    await agent.patch(`/api/admin/education/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 'invalid' }).expect(400);
    await agent.patch(`/api/admin/education/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 1 }).expect(400);
    try {
      await agent.patch(`/api/admin/education/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 'published' }).expect(200).expect({ id, ...publishedDraft, status: 'published' });
      await request(app.getHttpServer()).get('/api/education').expect(200).expect([...publicFixture, publishedDraft]);
      await agent.patch(`/api/admin/education/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 'archived' }).expect(200);
      await request(app.getHttpServer()).get('/api/education').expect(200).expect(publicFixture);
    } finally {
      await agent.patch(`/api/admin/education/${id}/status`).set('Origin', 'http://localhost:4200').send({ status: 'draft' }).expect(200);
    }
  });

  it('creates a server-owned Education Draft through the protected CMS boundary', async () => {
    const input = { institution: 'Temporary API Institute', qualification: 'Temporary API Qualification', summary: 'Fictional content used only to validate Education creation.', startDate: '2026-01-01', endDate: null };
    await request(app.getHttpServer()).post('/api/admin/education').send(input).expect(401);
    const agent = await authenticatedAgent();
    await agent.post('/api/admin/education').send(input).expect(403);
    await agent.post('/api/admin/education').set('Origin', 'https://untrusted.example').send(input).expect(403);
    await agent.post('/api/admin/education').set('Origin', 'http://localhost:4200').send({ ...input, institution: undefined }).expect(400);
    await agent.post('/api/admin/education').set('Origin', 'http://localhost:4200').send({ ...input, institution: 1 }).expect(400);
    await agent.post('/api/admin/education').set('Origin', 'http://localhost:4200').send({ ...input, qualification: '' }).expect(400);
    await agent.post('/api/admin/education').set('Origin', 'http://localhost:4200').send({ ...input, summary: 1 }).expect(400);
    await agent.post('/api/admin/education').set('Origin', 'http://localhost:4200').send({ ...input, startDate: '2026-02-31' }).expect(400);
    await agent.post('/api/admin/education').set('Origin', 'http://localhost:4200').send({ ...input, endDate: '2025-12-31' }).expect(400);
    let id = '';
    try {
      await agent.post('/api/admin/education').set('Origin', 'http://localhost:4200').send({ ...input, id: '00000000-0000-4000-8000-000000000099', status: 'published', displayOrder: 0 }).expect(201).expect(({ body }) => { id = body.id; expect(body).toEqual({ id: expect.any(String), ...input, status: 'draft' }); expect(id).not.toBe('00000000-0000-4000-8000-000000000099'); });
      await agent.get(`/api/admin/education/${id}`).expect(200).expect({ id, ...input, status: 'draft' });
      await agent.get('/api/admin/education').expect(200).expect(({ body }) => expect(body.at(-1)).toEqual({ id, institution: input.institution, qualification: input.qualification, status: 'draft' }));
      await request(app.getHttpServer()).get('/api/education').expect(200).expect([{ institution: 'Example Technical Institute', qualification: 'Example Software Engineering Diploma', summary: 'Fictional education fixture used to validate the public homepage path.', startDate: '2020-01-01', endDate: '2023-01-01' }]);
    } finally {
      if (id) await app.get(DatabaseService).db.delete(educations).where(eq(educations.id, id));
    }
  });

  it('moves Education through the protected adjacent ordering boundary', async () => {
    const id = '00000000-0000-4000-8000-000000000034';
    const publicFixture = [{ institution: 'Example Technical Institute', qualification: 'Example Software Engineering Diploma', summary: 'Fictional education fixture used to validate the public homepage path.', startDate: '2020-01-01', endDate: '2023-01-01' }];
    await request(app.getHttpServer()).patch(`/api/admin/education/${id}/order`).send({ direction: 'up' }).expect(401);
    const agent = await authenticatedAgent();
    await agent.patch(`/api/admin/education/${id}/order`).send({ direction: 'up' }).expect(403);
    await agent.patch(`/api/admin/education/${id}/order`).set('Origin', 'https://untrusted.example').send({ direction: 'up' }).expect(403);
    await agent.patch('/api/admin/education/not-a-uuid/order').set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(400);
    await agent.patch('/api/admin/education/00000000-0000-4000-8000-000000000099/order').set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(404);
    await agent.patch(`/api/admin/education/${id}/order`).set('Origin', 'http://localhost:4200').send({}).expect(400);
    await agent.patch(`/api/admin/education/${id}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'sideways' }).expect(400);
    try {
      await agent.patch(`/api/admin/education/${id}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'up' }).expect(200).expect([{ id, institution: 'Example Draft Institute', qualification: 'Example Draft Software Program', status: 'draft' }, { id: '00000000-0000-4000-8000-000000000030', institution: 'Example Technical Institute', qualification: 'Example Software Engineering Diploma', status: 'published' }]);
      await request(app.getHttpServer()).get('/api/education').expect(200).expect(publicFixture);
    } finally {
      await agent.patch(`/api/admin/education/${id}/order`).set('Origin', 'http://localhost:4200').send({ direction: 'down' }).expect(200);
    }
  });
});
