const request = require('supertest');
const app = require('../server');
const db = require('../src/db');

let authToken;
let userId;

beforeAll(async () => {
  const email = `cards-${Date.now()}@example.com`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Card Tester', email, password: 'secret123' });
  authToken = res.body.token;
  userId = res.body.user.id;
});

function authHeader() {
  return ['Authorization', `Bearer ${authToken}`];
}

describe('GET /api/cards', () => {
  it('returns a list of cards', async () => {
    const res = await request(app).get('/api/cards');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cards');
    expect(Array.isArray(res.body.cards)).toBe(true);
    expect(res.body).toHaveProperty('moods');
  });

  it('returns available moods', async () => {
    const res = await request(app).get('/api/cards');
    expect(res.body.moods).toEqual(
      expect.arrayContaining(['rolig', 'energisk', 'kreativ', 'nostalgisk', 'fokusert'])
    );
  });

  it('filters cards by mood', async () => {
    // Create a card with a known mood
    await request(app)
      .post('/api/cards')
      .set(...authHeader())
      .send({ title: 'Filter Test', mood: 'fokusert', color: '#112233' });

    const res = await request(app).get('/api/cards?mood=fokusert');
    expect(res.status).toBe(200);
    expect(res.body.cards.every((c) => c.mood === 'fokusert')).toBe(true);
  });
});

describe('GET /api/cards/:id', () => {
  it('returns a specific card', async () => {
    const cards = db.cards.all();
    const card = cards[0];
    const res = await request(app).get(`/api/cards/${card.id}`);

    expect(res.status).toBe(200);
    expect(res.body.card.id).toBe(card.id);
  });

  it('returns 404 for nonexistent card', async () => {
    const res = await request(app).get('/api/cards/nonexistent-id');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/cards', () => {
  it('creates a card when authenticated', async () => {
    const res = await request(app)
      .post('/api/cards')
      .set(...authHeader())
      .send({
        title: 'Ny idé',
        mood: 'kreativ',
        color: '#AABB00',
        description: 'Test kort',
        tags: ['test'],
      });

    expect(res.status).toBe(201);
    expect(res.body.card.title).toBe('Ny idé');
    expect(res.body.card.mood).toBe('kreativ');
    expect(res.body.card.ownerId).toBe(userId);
  });

  it('rejects without authentication', async () => {
    const res = await request(app)
      .post('/api/cards')
      .send({ title: 'Nope', mood: 'rolig', color: '#000000' });

    expect(res.status).toBe(401);
  });

  it('rejects missing title', async () => {
    const res = await request(app)
      .post('/api/cards')
      .set(...authHeader())
      .send({ mood: 'rolig', color: '#000000' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('Tittel')])
    );
  });

  it('rejects invalid mood', async () => {
    const res = await request(app)
      .post('/api/cards')
      .set(...authHeader())
      .send({ title: 'Test', mood: 'invalid', color: '#000000' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('Mood')])
    );
  });

  it('rejects invalid color format', async () => {
    const res = await request(app)
      .post('/api/cards')
      .set(...authHeader())
      .send({ title: 'Test', mood: 'rolig', color: 'not-a-color' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('Color')])
    );
  });

  it('rejects title longer than 80 characters', async () => {
    const res = await request(app)
      .post('/api/cards')
      .set(...authHeader())
      .send({ title: 'A'.repeat(81), mood: 'rolig', color: '#000000' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('80')])
    );
  });

  it('rejects non-string description', async () => {
    const res = await request(app)
      .post('/api/cards')
      .set(...authHeader())
      .send({ title: 'Test', mood: 'rolig', color: '#000000', description: 123 });

    expect(res.status).toBe(400);
  });

  it('rejects non-array tags', async () => {
    const res = await request(app)
      .post('/api/cards')
      .set(...authHeader())
      .send({ title: 'Test', mood: 'rolig', color: '#000000', tags: 'not-an-array' });

    expect(res.status).toBe(400);
  });

  it('defaults description and tags when omitted', async () => {
    const res = await request(app)
      .post('/api/cards')
      .set(...authHeader())
      .send({ title: 'Minimal', mood: 'rolig', color: '#FFFFFF' });

    expect(res.status).toBe(201);
    expect(res.body.card.description).toBe('');
    expect(res.body.card.tags).toEqual([]);
  });
});

describe('PUT /api/cards/:id', () => {
  let cardId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/cards')
      .set(...authHeader())
      .send({ title: 'Update Me', mood: 'rolig', color: '#111111' });
    cardId = res.body.card.id;
  });

  it('updates a card owned by the user', async () => {
    const res = await request(app)
      .put(`/api/cards/${cardId}`)
      .set(...authHeader())
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.card.title).toBe('Updated Title');
  });

  it('rejects update by non-owner', async () => {
    // Register a different user
    const otherEmail = `other-${Date.now()}@example.com`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Other', email: otherEmail, password: 'secret123' });

    const res = await request(app)
      .put(`/api/cards/${cardId}`)
      .set('Authorization', `Bearer ${regRes.body.token}`)
      .send({ title: 'Hijacked' });

    expect(res.status).toBe(403);
  });

  it('returns 404 for nonexistent card', async () => {
    const res = await request(app)
      .put('/api/cards/nonexistent')
      .set(...authHeader())
      .send({ title: 'Nope' });

    expect(res.status).toBe(404);
  });

  it('rejects without authentication', async () => {
    const res = await request(app)
      .put(`/api/cards/${cardId}`)
      .send({ title: 'No Auth' });

    expect(res.status).toBe(401);
  });

  it('allows partial update (only mood)', async () => {
    const res = await request(app)
      .put(`/api/cards/${cardId}`)
      .set(...authHeader())
      .send({ mood: 'energisk' });

    expect(res.status).toBe(200);
    expect(res.body.card.mood).toBe('energisk');
  });
});

describe('DELETE /api/cards/:id', () => {
  let cardId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/cards')
      .set(...authHeader())
      .send({ title: 'Delete Me', mood: 'rolig', color: '#222222' });
    cardId = res.body.card.id;
  });

  it('deletes a card owned by the user', async () => {
    const res = await request(app)
      .delete(`/api/cards/${cardId}`)
      .set(...authHeader());

    expect(res.status).toBe(204);

    const getRes = await request(app).get(`/api/cards/${cardId}`);
    expect(getRes.status).toBe(404);
  });

  it('rejects delete by non-owner', async () => {
    const otherEmail = `del-other-${Date.now()}@example.com`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Deleter', email: otherEmail, password: 'secret123' });

    const res = await request(app)
      .delete(`/api/cards/${cardId}`)
      .set('Authorization', `Bearer ${regRes.body.token}`);

    expect(res.status).toBe(403);
  });

  it('returns 404 for nonexistent card', async () => {
    const res = await request(app)
      .delete('/api/cards/nonexistent')
      .set(...authHeader());

    expect(res.status).toBe(404);
  });
});

describe('POST /api/cards/:id/like', () => {
  let cardId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/cards')
      .set(...authHeader())
      .send({ title: 'Like Me', mood: 'kreativ', color: '#333333' });
    cardId = res.body.card.id;
  });

  it('likes a card', async () => {
    const res = await request(app)
      .post(`/api/cards/${cardId}/like`)
      .set(...authHeader());

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(true);
    expect(res.body.card.likes).toContain(userId);
  });

  it('unlikes a previously liked card', async () => {
    await request(app)
      .post(`/api/cards/${cardId}/like`)
      .set(...authHeader());

    const res = await request(app)
      .post(`/api/cards/${cardId}/like`)
      .set(...authHeader());

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(false);
    expect(res.body.card.likes).not.toContain(userId);
  });

  it('returns 404 for nonexistent card', async () => {
    const res = await request(app)
      .post('/api/cards/nonexistent/like')
      .set(...authHeader());

    expect(res.status).toBe(404);
  });

  it('rejects without authentication', async () => {
    const res = await request(app)
      .post(`/api/cards/${cardId}/like`);

    expect(res.status).toBe(401);
  });
});
