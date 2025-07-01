CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO projects (title, description, url) VALUES 
  ('프로젝트 A', '설명 A', 'https://example.com'),
  ('프로젝트 B', '설명 B', 'https://example.org');
