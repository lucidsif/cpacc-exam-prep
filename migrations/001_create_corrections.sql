-- migrations/001_create_corrections.sql
CREATE TABLE corrections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT NOT NULL,
  item_label TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  page_url TEXT NOT NULL DEFAULT '',
  submitted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
