export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  role: string
  avatar_url: string | null
  referred_by: string | null
  referral_code: string | null
  title: string | null
  team_name: string | null
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  title: string | null
  avatar_url: string | null
  referred_by?: string | null
  depth: number
}

export interface TeamStats {
  direct_recruits: number
  total_team_size: number
  team_depth: number
}

export interface Client {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  status: string
  stage: string
  tags: string[]
  next_appointment: string | null
  last_contact: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ContactHistory {
  id: string
  client_id: string
  user_id: string
  type: "call" | "text" | "email" | "meeting"
  outcome: string | null
  notes: string | null
  timestamp: string
  created_at: string
}

export interface ClientFile {
  id: string
  client_id: string
  user_id: string
  name: string
  type: string | null
  size: number | null
  storage_path: string | null
  uploaded_at: string
}

export interface Script {
  id: string
  user_id: string
  title: string
  category: string | null
  content: string
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  client_id: string | null
  title: string
  description: string | null
  start_time: string
  end_time: string
  event_type: string
  status: string
  created_at: string
  updated_at: string
}

export interface PerformanceMetric {
  id: string
  user_id: string
  period_start: string
  period_end: string
  calls_made: number
  appointments_set: number
  presentations_given: number
  policies_sold: number
  revenue: number
  created_at: string
}
