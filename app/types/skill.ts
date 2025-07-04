export interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  icon_name: string | null;
  order_index: number;
  created_at: string;
}

export interface CategoryConfig {
  value: string;
  label: string;
}

export const SKILL_CATEGORIES: CategoryConfig[] = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "database", label: "Database" },
  { value: "tools", label: "Tools" },
  { value: "mobile", label: "Mobile" },
  { value: "devops", label: "DevOps" },
];
