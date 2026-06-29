const request = require('supertest');
const app = require('../server');
const db = require('../src/db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../src/middleware/auth');

// Reset db state between tests
beforeEach(() => {
  // Clear users so each test starts clean
  while (db.users.findByEmail('test@example.com')) {
    const idx = db.cards.all(); // just access to trigger load
    break;
  }
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns token', async () => {
    const email = `reg-${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email, password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.name).toBe('Test User');
    expect(res.body.user.email).toBe(email.toLowerCase());
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('rejects when name is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'no-name@test.com', password: 'secret123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', password: 'secret123' });

    expect(res.status).toBe(400);
  });

  it('rejects when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'no-pass@test.com' });

    expect(res.status).toBe(400);
  });

  it('rejects password shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'short@test.com', password: '12345' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/6/);
  });

  it('rejects duplicate email', async () => {
    const email = `dup-${Date.now()}@example.com`;
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'First', email, password: 'secret123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Second', email, password: 'secret456' });

    expect(res.status).toBe(409);
  });

  it('normalizes email to lowercase', async () => {
    const email = `UPPER-${Date.now()}@EXAMPLE.COM`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email, password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email.toLowerCase().trim());
  });
});

describe('POST /api/auth/login', () => {
  let registeredEmail;

  beforeAll(async () => {
    registeredEmail = `login-${Date.now()}@example.com`;
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Login User', email: registeredEmail, password: 'mypassword' });
  });

  it('logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: registeredEmail, password: 'mypassword' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(registeredEmail);
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: registeredEmail, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('rejects nonexistent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@nowhere.com', password: 'anything' });

    expect(res.status).toBe(401);
  });

  it('rejects when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'something' });

    expect(res.status).toBe(400);
  });

  it('rejects when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: registeredEmail });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('returns user profile for valid token', async () => {
    const email = `me-${Date.now()}@example.com`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Me User', email, password: 'secret123' });

    const token = regRes.body.token;
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.name).toBe('Me User');
  });

  it('rejects without token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('rejects with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });
});
