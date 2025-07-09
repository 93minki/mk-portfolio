# 🚀 Dev Portfolio

개인 포트폴리오 웹사이트 - Remix + Cloudflare Pages로 구축된 개발자 포트폴리오

## ✨ 주요 기능

- 📱 **반응형 디자인** - 모바일부터 데스크톱까지 완벽 대응
- ⚡ **빠른 성능** - Cloudflare의 글로벌 CDN으로 전 세계 어디서나 빠른 로딩
- 🎨 **모던한 UI** - Tailwind CSS로 구현된 깔끔하고 세련된 디자인
- 🛠️ **관리자 페이지** - 실시간으로 포트폴리오 내용 수정 가능
- 📊 **D1 데이터베이스** - Cloudflare D1으로 안정적인 데이터 관리
- 🔧 **TypeScript** - 타입 안전성으로 버그 최소화

## 🛠️ 기술 스택

### Frontend

- **Framework**: [Remix](https://remix.run/) 2.16.8
- **Build Tool**: [Vite](https://vitejs.dev/) 6.0.0
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 3.4.4
- **Language**: TypeScript 5.1.6
- **Icons**: [Simple Icons](https://simpleicons.org/)

### Backend & Infrastructure

- **Runtime**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **Deployment**: [Wrangler](https://developers.cloudflare.com/workers/wrangler/) 3.x

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

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:5173 에서 확인 가능합니다.

> **💡 참고**: 첫 실행 시 로컬 데이터베이스가 자동으로 생성됩니다.

## 🗃️ 데이터베이스 구조

### 주요 테이블

- **experiences** - 경력 정보
- **projects** - 프로젝트 정보
- **skills** - 기술 스택 정보

### 데이터베이스 관리

#### 로컬 개발

```bash
# 로컬 DB 쿼리 실행
npx wrangler d1 execute DB --local --command "SELECT * FROM experiences"

# SQL 파일 실행 (테이블 생성)
npx wrangler d1 execute DB --local --file=./app/db/schema.sql
npx wrangler d1 execute DB --local --file=./app/db/tables.sql
```

#### 프로덕션 배포

```bash
# 원격 DB에 테이블 생성
npx wrangler d1 execute DB --file=./app/db/schema.sql
npx wrangler d1 execute DB --file=./app/db/tables.sql

# 원격 DB 쿼리 실행
npx wrangler d1 execute DB --command "SELECT * FROM experiences"
```

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
│   ├── routes/             # Remix 라우트 파일
│   ├── hooks/              # 커스텀 React 훅
│   ├── types/              # TypeScript 타입 정의
│   └── utils/              # 유틸리티 함수
├── functions/              # Cloudflare Pages Functions
├── public/                 # 정적 파일
└── wrangler.toml          # Cloudflare 설정
```

## 🎨 커스터마이징

### 스킬 아이콘 추가

1. [Simple Icons](https://simpleicons.org/)에서 원하는 아이콘 검색
2. 관리자 페이지에서 스킬 추가 시 아이콘 이름 입력
3. 자동으로 CDN에서 아이콘 로드

### 테마 및 색상

`tailwind.config.ts`에서 색상 팔레트 및 테마 커스터마이징 가능

## 🔧 환경 변수

로컬 개발용 `.dev.vars` 파일 생성:

```bash
# .dev.vars
ADMIN_PASSWORD=your_admin_password
SESSION_SECRET=your_session_secret
```

## 📊 성능 최적화

- **이미지 최적화**: 자동 WebP 변환 및 lazy loading
- **코드 분할**: Remix의 자동 코드 분할로 최적화된 번들 크기
- **CDN 캐싱**: Cloudflare의 글로벌 CDN으로 빠른 콘텐츠 전송
- **Database**: D1의 SQLite 기반 빠른 쿼리 성능
