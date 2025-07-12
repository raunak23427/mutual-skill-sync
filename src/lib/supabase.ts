import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types matching our database schema
export interface Profile {
  id: string;
  clerk_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  location?: string;
  availability: string;
  is_public: boolean;
  bio?: string;
  rating: number;
  total_swaps: number;
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
  description?: string;
  is_approved: boolean;
  created_at: string;
}

export interface UserSkillOffered {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency_level: string;
  years_experience?: number;
  created_at: string;
  skill?: Skill;
}

export interface UserSkillWanted {
  id: string;
  user_id: string;
  skill_id: string;
  urgency: string;
  created_at: string;
  skill?: Skill;
}

export interface SwapRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  requester_skill_id?: string;
  recipient_skill_id?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface Feedback {
  id: string;
  swap_session_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  is_public: boolean;
  created_at: string;
}
