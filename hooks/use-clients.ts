"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { Client } from "@/lib/crm-data"

// Database client type
export interface DbClient {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  status: string
  stage: string
  assigned_agent: string | null
  tags: string[]
  next_appointment: string | null
  last_contact: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Transform database client to app client format
export function transformDbClient(dbClient: DbClient): Client {
  return {
    id: dbClient.id,
    firstName: dbClient.first_name,
    lastName: dbClient.last_name,
    email: dbClient.email || "",
    phone: dbClient.phone || "",
    status: dbClient.status as Client["status"],
    stage: dbClient.stage as Client["stage"],
    assignedAgent: dbClient.assigned_agent || "",
    tags: dbClient.tags || [],
    nextAppointment: dbClient.next_appointment || undefined,
    lastContact: dbClient.last_contact || undefined,
    createdAt: dbClient.created_at,
    notes: dbClient.notes || "",
    files: [],
    contactHistory: [],
  }
}

async function fetchClients(): Promise<Client[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching clients:", error)
      return []
    }

    return (data || []).map(transformDbClient)
  } catch (err) {
    console.error("[v0] Exception fetching clients:", err)
    return []
  }
}

export function useClients() {
  const { data, error, isLoading, mutate } = useSWR<Client[]>("clients", fetchClients, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  return {
    clients: data || [],
    isLoading,
    error,
    refresh: mutate,
  }
}
