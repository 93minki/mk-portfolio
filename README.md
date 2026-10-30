# 🚀 Dev Portfolio

개인 포트폴리오 웹사이트 - React Router + Node.js로 구축된 개발자 포트폴리오

## ✨ 주요 기능

- 📱 **반응형 디자인** - 모바일부터 데스크톱까지 완벽 대응
- ⚡ **빠른 성능** - Vite와 서버 렌더링으로 빠른 로딩
- 🎨 **모던한 UI** - Tailwind CSS로 구현된 깔끔하고 세련된 디자인
- 🛠️ **관리자 페이지** - 실시간으로 포트폴리오 내용 수정 가능
- 📊 **SQLite 데이터베이스** - 로컬 파일로 데이터 관리
- 🔧 **TypeScript** - 타입 안전성으로 버그 최소화

## 🛠️ 기술 스택

### Frontend

- **Framework**: [React Router](https://reactrouter.com/) 8.5
- **Build Tool**: [Vite](https://vitejs.dev/) 8.3
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.3
- **Language**: TypeScript 6.0
- **Icons**: [Simple Icons](https://simpleicons.org/)

### Backend & Infrastructure

- **Runtime**: Node.js 22.22 이상
- **Database**: SQLite (better-sqlite3)

### Development Tools

- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Package Manager**: npm

## 🚀 빠른 시작

### 1. 프로젝트 클론

```bash
git clone https://github.com/93minki/mk-portfolio.git
cd mk-portfolio
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 및 데이터 준비

```bash
cp .env.example .env
# .env에서 ADMIN_PASSWORD와 SESSION_SECRET 변경
npm run db:import -- app/db/seed.sql
npm run dev
```

http://localhost:5173 에서 확인 가능합니다. 운영 서버는 `npm run build && npm start`로 실행합니다.

## Docker로 실행

`.env.example`을 `.env`로 복사하고 `ADMIN_PASSWORD`와 `SESSION_SECRET`을 설정합니다.

```bash
docker compose up -d --build
```

http://localhost:3000 에서 확인합니다. SQL 데이터를 가져오려면 `backup` 폴더에 파일을 넣고 실행합니다.

```bash
docker compose stop app
docker compose run --rm -v "$PWD/backup:/backup:ro" app node scripts/db-import.mjs /backup/<파일>.sql
docker compose start app
```

Cloudflare 터널을 사용하려면 `.env`에 `TUNNEL_TOKEN`을 설정하고 실행합니다.

```bash
docker compose --profile tunnel up -d
```

## 🗃️ 데이터베이스

SQLite 파일은 기본적으로 `data/portfolio.sqlite`에 생성되며 `DATABASE_PATH`로 변경할 수 있습니다. Docker에서는 `portfolio-data` 볼륨의 `/data/portfolio.sqlite`를 사용합니다. 앱은 실행 시 테이블을 자동 생성합니다. 샘플 데이터나 기존 SQL 내보내기 파일은 `npm run db:import -- <파일 경로>`로 가져옵니다. 데이터가 있는 DB는 가져오기를 거부하며, `--force`는 기존 DB 파일을 삭제하고 교체합니다.

테이블: `personal_info`, `experiences`, `projects`, `skills`.

## 📁 프로젝트 구조

```
mk-portfolio/
├── app/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── admin/          # 관리자 페이지 컴포넌트
│   │   ├── experience/     # 경력 관련 컴포넌트
│   │   ├── projects/       # 프로젝트 관련 컴포넌트
│   │   ├── skills/         # 스킬 관련 컴포넌트
│   │   └── ui/            # 기본 UI 컴포넌트
│   ├── db/                 # 데이터베이스 스키마 및 설정
│   ├── routes/             # React Router 라우트 파일
│   ├── hooks/              # 커스텀 React 훅
│   ├── types/              # TypeScript 타입 정의
│   └── utils/              # 유틸리티 함수
├── public/                 # 정적 파일
└── .env.example            # 환경 변수 예제
```

## 🎨 커스터마이징

### 스킬 아이콘 추가

1. [Simple Icons](https://simpleicons.org/)에서 원하는 아이콘 검색
2. 관리자 페이지에서 스킬 추가 시 아이콘 이름 입력
3. 자동으로 CDN에서 아이콘 로드

### 테마 및 색상

`tailwind.config.ts`에서 색상 팔레트 및 테마 커스터마이징 가능

## 🔧 환경 변수

`.env.example`을 `.env`로 복사하고 `ADMIN_PASSWORD`, `SESSION_SECRET`을 설정합니다. 선택 항목은 `OWNER_NAME`, `OWNER_POSITION`, `CF_SITE_TAG`, `DATABASE_PATH`, `NODE_ENV`, `TUNNEL_TOKEN`입니다. 프로세스 환경 변수는 `.env`보다 우선합니다.

## 📊 성능 최적화

- **이미지 최적화**: 자동 WebP 변환 및 lazy loading
- **코드 분할**: React Router의 자동 코드 분할로 최적화된 번들 크기
- **Database**: SQLite 기반 쿼리
