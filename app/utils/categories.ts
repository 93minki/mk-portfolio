export interface CategoryConfig {
  value: string;
  label: string;
  description: string;
}

export interface CategoriesConfig {
  categories: CategoryConfig[];
}

/**
 * 카테고리 설정 파일을 불러오는 함수
 */
export async function loadCategories(
  type: "project" | "skill"
): Promise<CategoryConfig[]> {
  try {
    const response = await fetch(`/config/${type}-categories.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${type} categories`);
    }
    const config: CategoriesConfig = await response.json();
    return config.categories;
  } catch (error) {
    console.error(`Error loading ${type} categories:`, error);
    // 기본 카테고리 반환
    return getDefaultCategories(type);
  }
}

/**
 * 기본 카테고리 반환 (설정 파일 로드 실패 시)
 */
function getDefaultCategories(type: "project" | "skill"): CategoryConfig[] {
  if (type === "project") {
    return [
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
    ];
  } else {
    return [
      {
        value: "frontend",
        label: "Frontend",
        description: "프론트엔드 개발 기술",
      },
      { value: "backend", label: "Backend", description: "백엔드 개발 기술" },
      {
        value: "database",
        label: "Database",
        description: "데이터베이스 관련 기술",
      },
      { value: "tools", label: "Tools", description: "개발 도구 및 유틸리티" },
      { value: "others", label: "Others", description: "기타 기술" },
    ];
  }
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
