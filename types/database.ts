// TypeScript interfaces representing the Supabase database schema for Hunar Pass

export type TradeType =
  | 'Plumber'
  | 'Electrician'
  | 'Mason'
  | 'Carpenter'
  | 'Painter'
  | 'Welder'
  | 'Mechanic';

export type SkillLevel =
  | 'beginner'
  | 'intermediate'
  | 'expert'
  | 'needs more evidence';

export type SupportedLanguage = 'en-IN' | 'hi-IN' | 'kn-IN';
export type RelationshipType = 'customer' | 'co-worker' | 'employer';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  trade: TradeType;
  language: SupportedLanguage;
  area: string;
  experience_years: number;
  created_at: string;
}

export interface IndicativeWageRange {
  min: number;
  max: number;
  label: string; // e.g. "Estimated daily rate for Bengaluru • sample data"
}

export interface SkillCard {
  id: string;
  worker_id: string;
  summary: string;
  skills: string[];
  level: SkillLevel;
  level_reason?: string | null;
  transcript: string | null;
  next_steps: string | null;
  wage_min: number | null;
  wage_max: number | null;
  wage_label?: string | null;
  created_at: string;
}

export interface Vouch {
  id: string;
  worker_id: string;
  voucher_name: string;
  voucher_phone: string;
  relationship: RelationshipType;
  job_date: string;
  would_hire_again?: boolean;
  comment: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  trade: TradeType;
  area: string;
  pay: string;
  employer_name: string;
  contact: string;
  created_at: string;
}

export interface WorkerWithDetails extends Worker {
  skill_card?: SkillCard | null;
  vouches?: Vouch[];
}
