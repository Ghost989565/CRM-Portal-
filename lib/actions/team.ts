"use server"

import { createClient } from "@/lib/supabase/server"
import type { TeamMember, TeamStats, Profile } from "@/lib/types/database"

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
  
  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }
  
  return data
}

export async function getUpline(userId: string): Promise<TeamMember[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc("get_upline", {
    user_id: userId,
    max_depth: 10
  })
  
  if (error) {
    console.error("Error fetching upline:", error)
    return []
  }
  
  return data || []
}

export async function getDownline(userId: string): Promise<TeamMember[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc("get_downline", {
    user_id: userId,
    max_depth: 10
  })
  
  if (error) {
    console.error("Error fetching downline:", error)
    return []
  }
  
  return data || []
}

export async function getTeamStats(userId: string): Promise<TeamStats | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc("get_team_stats", {
    user_id: userId
  })
  
  if (error) {
    console.error("Error fetching team stats:", error)
    return null
  }
  
  return data?.[0] || null
}

export async function getDirectRecruits(userId: string): Promise<TeamMember[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, title, avatar_url")
    .eq("referred_by", userId)
  
  if (error) {
    console.error("Error fetching direct recruits:", error)
    return []
  }
  
  return (data || []).map(d => ({ ...d, depth: 1 }))
}

export async function getReferrer(userId: string): Promise<TeamMember | null> {
  const supabase = await createClient()
  
  // First get the current user's referred_by
  const { data: profile } = await supabase
    .from("profiles")
    .select("referred_by")
    .eq("id", userId)
    .single()
  
  if (!profile?.referred_by) return null
  
  // Then get the referrer's profile
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, title, avatar_url")
    .eq("id", profile.referred_by)
    .single()
  
  if (error) {
    console.error("Error fetching referrer:", error)
    return null
  }
  
  return data ? { ...data, depth: 1 } : null
}

export async function copyReferralLink(referralCode: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${baseUrl}/auth/sign-up?ref=${referralCode}`
}
