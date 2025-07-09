-- Skills 테이블
CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency INTEGER DEFAULT 2, -- 1: 초급, 2: 중급, 3: 고급, 4: 전문가
  icon_name TEXT,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 개인정보 테이블
CREATE TABLE IF NOT EXISTS personal_info (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 경력 테이블
CREATE TABLE IF NOT EXISTS experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL, -- YYYY-MM 형식
  end_date TEXT, -- YYYY-MM 형식, NULL이면 현재 근무중
  is_current BOOLEAN DEFAULT 0,
  location TEXT,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  image_url TEXT,
  tech_stack TEXT NOT NULL, -- JSON 배열로 저장
  github_url TEXT,
  demo_url TEXT,
  category TEXT NOT NULL, -- 'personal', 'client', 'work' 등
  featured BOOLEAN DEFAULT 0,
  status TEXT DEFAULT 'completed', -- 'completed', 'in_progress', 'archived'
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 