const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error(
    'FATAL: JWT_SECRET environment variable is not set. ' +
    'Copy .env.example to .env and set a strong random value.'
  );
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

// Krever en gyldig "Bearer <token>" Authorization-header.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Mangler eller ugyldig token.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Token er ugyldig eller utløpt.' });
  }
}

module.exports = { requireAuth, JWT_SECRET };
