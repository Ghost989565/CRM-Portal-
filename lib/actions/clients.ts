"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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

export async function getClients() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized", data: null }
  }

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching clients:", error)
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function createClient(formData: ClientFormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized", data: null }
  }

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
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`
        : user.email?.split("@")[0] || "Agent",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating client:", error)
    return { error: error.message, data: null }
  }

  revalidatePath("/portal/clients")
  return { data, error: null }
}

export async function updateClient(clientId: string, formData: Partial<ClientFormData>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized", data: null }
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (formData.firstName !== undefined) updateData.first_name = formData.firstName
  if (formData.lastName !== undefined) updateData.last_name = formData.lastName
  if (formData.email !== undefined) updateData.email = formData.email
  if (formData.phone !== undefined) updateData.phone = formData.phone
  if (formData.status !== undefined) updateData.status = formData.status
  if (formData.stage !== undefined) updateData.stage = formData.stage
  if (formData.notes !== undefined) updateData.notes = formData.notes
  if (formData.tags !== undefined) updateData.tags = formData.tags

  const { data, error } = await supabase
    .from("clients")
    .update(updateData)
    .eq("id", clientId)
    .select()
    .single()

  if (error) {
    console.error("Error updating client:", error)
    return { error: error.message, data: null }
  }

  revalidatePath("/portal/clients")
  return { data, error: null }
}

export async function deleteClient(clientId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)

  if (error) {
    console.error("Error deleting client:", error)
    return { error: error.message }
  }

  revalidatePath("/portal/clients")
  return { error: null }
}

export async function logContact(clientId: string, type: "call" | "text" | "email" | "meeting", notes?: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized", data: null }
  }

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

  if (error) {
    console.error("Error logging contact:", error)
    return { error: error.message, data: null }
  }

  // Update last_contact on client
  await supabase
    .from("clients")
    .update({ last_contact: new Date().toISOString() })
    .eq("id", clientId)

  revalidatePath("/portal/clients")
  return { data, error: null }
}
