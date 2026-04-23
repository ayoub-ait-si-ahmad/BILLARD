const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// SQLite setup using Node.js built-in sqlite (Node 22+)
const db = new DatabaseSync(path.join(__dirname, 'petition.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS signers (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    city      TEXT    NOT NULL,
    email     TEXT,
    price     TEXT,
    signed_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  INSERT OR IGNORE INTO meta (key, value) VALUES ('base_count', '24736');
`);

app.use(express.json());
app.use(express.static(__dirname));

// GET /api/count
app.get('/api/count', (_req, res) => {
  const row = db.prepare(`
    SELECT CAST(m.value AS INTEGER) + COUNT(s.id) AS total
    FROM meta m
    LEFT JOIN signers s ON 1=1
    WHERE m.key = 'base_count'
  `).get();
  res.json({ count: row.total });
});

// GET /api/signers
app.get('/api/signers', (_req, res) => {
  const rows = db.prepare(`
    SELECT name, city, signed_at
    FROM signers
    ORDER BY id DESC
    LIMIT 20
  `).all();
  const now = Math.floor(Date.now() / 1000);
  const signers = rows.map(r => ({
    name: r.name,
    city: r.city,
    mins: Math.floor((now - r.signed_at) / 60),
  }));
  res.json({ signers });
});

// POST /api/sign
app.post('/api/sign', (req, res) => {
  const { name, city, email, price } = req.body || {};
  if (!name || !city) {
    return res.status(400).json({ error: 'name and city are required' });
  }
  db.prepare(`
    INSERT INTO signers (name, city, email, price) VALUES (?, ?, ?, ?)
  `).run(
    name.trim().slice(0, 120),
    city.trim().slice(0, 80),
    (email || '').trim().slice(0, 200) || null,
    (price || '').trim().slice(0, 60) || null
  );
  const row = db.prepare(`
    SELECT CAST(m.value AS INTEGER) + COUNT(s.id) AS total
    FROM meta m
    LEFT JOIN signers s ON 1=1
    WHERE m.key = 'base_count'
  `).get();
  res.json({ count: row.total });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
