export interface Experience {
  id: number;
  company_name: string;
  position: string;
  description: string | null;
  start_date: string; // YYYY-MM 형식
  end_date: string | null; // YYYY-MM 형식, null이면 현재 근무중
  is_current: boolean;
  location: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}
