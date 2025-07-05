export interface CategoryConfig {
  value: string;
  label: string;
  description: string;
}

/**
 * 프로젝트 카테고리 설정
 * 다른 개발자들이 자신의 상황에 맞게 쉽게 수정할 수 있도록 상수로 관리
 */
export const PROJECT_CATEGORIES: CategoryConfig[] = [
  {
    value: "personal",
    label: "개인 프로젝트",
    description: "개인적으로 진행한 프로젝트",
  },
  {
    value: "client",
    label: "클라이언트 프로젝트",
    description: "클라이언트를 위해 진행한 프로젝트",
  },
  {
    value: "work",
    label: "회사 프로젝트",
    description: "회사에서 진행한 프로젝트",
  },
  {
    value: "study",
    label: "스터디 프로젝트",
    description: "학습 목적으로 진행한 프로젝트",
  },
  {
    value: "team",
    label: "팀 프로젝트",
    description: "팀과 함께 진행한 프로젝트",
  },
];

/**
 * 스킬 카테고리 설정
 * 다른 개발자들이 자신의 상황에 맞게 쉽게 수정할 수 있도록 상수로 관리
 */
export const SKILL_CATEGORIES: CategoryConfig[] = [
  {
    value: "frontend",
    label: "Frontend",
    description: "프론트엔드 개발 기술",
  },
  {
    value: "backend",
    label: "Backend",
    description: "백엔드 개발 기술",
  },
  {
    value: "database",
    label: "Database",
    description: "데이터베이스 관련 기술",
  },
  {
    value: "tools",
    label: "Tools",
    description: "개발 도구 및 유틸리티",
  },
  {
    value: "others",
    label: "Others",
    description: "기타 기술",
  },
];

/**
 * 타입에 따른 카테고리 반환
 */
export function getCategories(type: "project" | "skill"): CategoryConfig[] {
  return type === "project" ? PROJECT_CATEGORIES : SKILL_CATEGORIES;
}

/**
 * 카테고리 값으로 라벨 찾기
 */
export function getCategoryLabel(
  categories: CategoryConfig[],
  value: string
): string {
  const category = categories.find((cat) => cat.value === value);
  return category ? category.label : value;
}
