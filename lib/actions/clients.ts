"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient, isSupabaseServerConfigured } from "@/lib/supabase/server"

export type ClientFormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
  stage: string
  notes?: string
  tags?: string[]
}

export async function createClientRecord(formData: ClientFormData) {
  if (!isSupabaseServerConfigured()) {
    return { error: "Supabase is not configured", data: null }
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized", data: null }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      user_id: user.id,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email || null,
      phone: formData.phone || null,
      status: formData.status || "New Lead",
      stage: formData.stage || "Prospect",
      notes: formData.notes || null,
      tags: formData.tags || [],
      assigned_agent: user.user_metadata?.first_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`.trim()
        : user.email?.split("@")[0] || "Agent",
    })
    .select()
    .single()

  if (error) return { error: error.message, data: null }

  revalidatePath("/portal/clients")
  return { error: null, data }
}

export async function logContact(clientId: string, type: "call" | "text" | "email" | "meeting", notes?: string) {
  if (!isSupabaseServerConfigured()) {
    return { error: "Supabase is not configured", data: null }
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized", data: null }

  const { data, error } = await supabase
    .from("contact_logs")
    .insert({
      client_id: clientId,
      user_id: user.id,
      type,
      outcome: `${type} initiated`,
      notes: notes || `${type} action performed`,
    })
    .select()
    .single()

  if (error) return { error: error.message, data: null }

  await supabase.from("clients").update({ last_contact: new Date().toISOString() }).eq("id", clientId)
  revalidatePath("/portal/clients")

  return { error: null, data }
}
