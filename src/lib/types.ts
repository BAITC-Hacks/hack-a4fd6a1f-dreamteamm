export type UserRole = 'business' | 'student' | 'admin';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  organization?: string | null;
  team_name?: string | null;
  skills?: string | null; // e.g. "React, Python, Machine Learning"
  interests?: string | null; // e.g. "E-Commerce, FinTech, CleanTech"
  xp_points: number;
  created_at: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export type TaskCategory = 'Design' | 'Engineering' | 'Data' | 'Business' | 'CleanTech' | 'FinTech';
export type TaskStatus = 'Draft' | 'Needs Info' | 'Published' | 'In Progress' | 'Closed';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type ReadinessTier = 'draft' | 'working' | 'ready' | 'priority';

export interface Task {
  id: number;
  title: string;
  category: TaskCategory;
  owner_id?: number | null;
  owner: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string; // comma-separated
  
  // 8 Mandatory Hackathon Evaluation Fields (100 pts total)
  context_need: string;      // Контекст и потребность (20)
  data_materials: string;    // Данные и материалы (20)
  expected_result: string;   // Ожидаемый результат (15)
  success_criteria: string;  // Критерии успеха (15)
  constraints: string;       // Ограничения (10)
  target_users: string;      // Пользователи (10)
  business_contact: string;  // Связь с бизнесом (10)

  notes: string; // Full combined text / notes
  readiness_score: number; // 0-100
  readiness_tier: ReadinessTier;
  last_updated: string;
  attachment_key?: string | null;
  attachment_name?: string | null;
  proposals_count?: number;
}

export type ProposalStatus = 'Submitted' | 'Shortlisted' | 'Selected' | 'Rejected';

export interface Proposal {
  id: number;
  task_id: number;
  student_id?: number | null;
  team_name: string;
  student_name: string;
  student_contact: string;
  
  // Hackathon proposal fields
  solution_idea: string;   // Идея решения
  plan: string;            // План работы
  timeline: string;        // Сроки
  prototype_url: string;   // Ссылка на прототип / портфолио
  pitch?: string;          // Combined pitch
  
  status: ProposalStatus;
  stage_points_awarded: number; // Gamification points
  created_at: string;
  attachment_key?: string | null;
  attachment_name?: string | null;
  task_title?: string;
}

export interface Feedback {
  id: number;
  task_id?: number | null;
  user_name: string;
  feedback_type: 'platform' | 'task' | 'feature' | 'bug';
  content: string;
  created_at: string;
  task_title?: string | null;
}

export interface ReadinessScoreResult {
  score: number;
  tier: ReadinessTier;
  tierLabel: string;
  tierBadgeColor: string;
  breakdown: {
    field: string;
    label: string;
    points: number;
    maxPoints: number;
    passed: boolean;
    suggestion: string;
  }[];
  missingFields: string[];
  suggestions: string[];
}

export interface ClarifyingQuestion {
  id: string;
  targetField: string;
  question: string;
  whyNeeded: string;
  placeholder: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  errors: FieldError[];
}
