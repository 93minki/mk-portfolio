export interface Project {
  id: number;
  title: string;
  description: string;
  long_description?: string;
  image_url?: string;
  tech_stack: string; // JSON 문자열
  github_url?: string;
  demo_url?: string;
  category: "personal" | "client" | "work";
  featured: boolean;
  status: "completed" | "in_progress" | "archived";
  order_index: number;
  created_at: string;
  updated_at: string;
}

export type ProjectCategory = Project["category"];
export type ProjectStatus = Project["status"];
