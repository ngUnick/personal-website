import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash, randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { sessionCookieName } from '../src/admin-auth/admin-auth.service.js';
import { DatabaseService } from '../src/database/database.service.js';
import { adminSessions } from '../src/database/schema.js';

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
      }));

  it('returns 404 when a project slug is not public', () =>
    request(app.getHttpServer())
      .get('/api/projects/unknown-project')
      .expect(404));
});
