-- 기존 테이블 삭제 (개발 단계에서만)
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS personal_info;

-- 확장된 프로젝트 테이블
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT, -- 상세 페이지용 긴 설명
  image_url TEXT, -- 프로젝트 썸네일
  tech_stack TEXT NOT NULL, -- JSON 형태로 기술 스택 저장 ["React", "TypeScript", "Tailwind"]
  github_url TEXT, -- GitHub 저장소
  demo_url TEXT, -- 라이브 데모 (기존 url을 이것으로 변경)
  category TEXT NOT NULL DEFAULT 'personal', -- 'personal', 'client', 'work'
  featured BOOLEAN DEFAULT 0, -- 메인 페이지 노출 여부
  status TEXT DEFAULT 'completed', -- 'completed', 'in_progress', 'archived'
  order_index INTEGER DEFAULT 0, -- 정렬 순서
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 기술 스택 관리 테이블
CREATE TABLE skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE, -- 'React', 'TypeScript' 등
  category TEXT NOT NULL, -- 'frontend', 'backend', 'tools', 'database'
  proficiency INTEGER DEFAULT 3, -- 1-5 숙련도
  icon_name TEXT, -- 아이콘 이름 (선택사항)
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 개인 정보 및 설정 테이블
CREATE TABLE personal_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE, -- 'name', 'bio', 'email', 'github', 'linkedin' 등
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 샘플 프로젝트 데이터 (Thomas 사이트 스타일)
INSERT INTO projects (title, description, long_description, tech_stack, github_url, demo_url, category, featured, order_index) VALUES 
  (
    'React Todo App', 
    'TypeScript와 Tailwind CSS를 사용한 모던한 Todo 애플리케이션. 드래그 앤 드롭과 다크모드를 지원합니다.',
    'React Todo App은 현대적인 웹 개발 스택을 활용한 할 일 관리 애플리케이션입니다. TypeScript로 타입 안정성을 보장하고, Tailwind CSS로 반응형 디자인을 구현했습니다.',
    '["React", "TypeScript", "Tailwind CSS", "Vite"]',
    'https://github.com/93minki/react-todo',
    'https://react-todo-demo.vercel.app',
    'personal',
    1,
    1
  ),
  (
    'Next.js E-commerce', 
    'Next.js 13 App Router와 Supabase를 활용한 전자상거래 플랫폼. 서버 컴포넌트와 SSR을 적극 활용했습니다.',
    'Next.js 13의 App Router를 활용한 현대적인 전자상거래 플랫폼입니다. Supabase를 백엔드로 사용하여 실시간 데이터 동기화와 인증을 구현했습니다.',
    '["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "Stripe"]',
    'https://github.com/93minki/nextjs-ecommerce',
    'https://nextjs-ecommerce-demo.vercel.app',
    'personal',
    1,
    2
  ),
  (
    '클라이언트 랜딩 페이지', 
    'React와 Framer Motion을 활용한 인터랙티브 랜딩 페이지 개발.',
    '클라이언트를 위한 프리미엄 랜딩 페이지 개발 프로젝트입니다. Framer Motion을 활용한 매끄러운 애니메이션과 최적화된 성능을 제공합니다.',
    '["React", "Framer Motion", "Tailwind CSS", "Vite"]',
    '',
    'https://client-landing-demo.com',
    'client',
    1,
    3
  );

-- 기술 스택 샘플 데이터
INSERT INTO skills (name, category, proficiency, order_index) VALUES 
  ('React', 'frontend', 5, 1),
  ('TypeScript', 'frontend', 5, 2),
  ('Next.js', 'frontend', 4, 3),
  ('Tailwind CSS', 'frontend', 5, 4),
  ('JavaScript', 'frontend', 5, 5),
  ('Remix', 'frontend', 4, 6),
  ('Supabase', 'backend', 4, 7),
  ('Node.js', 'backend', 4, 8),
  ('PostgreSQL', 'database', 3, 9),
  ('Vite', 'tools', 4, 10),
  ('Git', 'tools', 5, 11),
  ('Figma', 'tools', 3, 12);

-- 개인 정보 샘플 데이터
INSERT INTO personal_info (key, value) VALUES 
  ('name', '김민기'),
  ('title', 'Frontend Developer'),
  ('bio', '사용자 경험을 중시하는 프론트엔드 개발자입니다. React와 TypeScript를 주로 사용하며, 모던한 웹 기술에 관심이 많습니다.'),
  ('email', 'your-email@example.com'),
  ('github', 'https://github.com/93minki'),
  ('linkedin', 'https://linkedin.com/in/yourprofile'),
  ('location', 'Seoul, South Korea');
