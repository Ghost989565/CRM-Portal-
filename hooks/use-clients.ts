"use client"

import useSWR from "swr"
import type { Client } from "@/lib/crm-data"
import { createOptionalClient } from "@/lib/supabase/client"

interface DbClient {
  id: string
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
}

function transformDbClient(dbClient: DbClient): Client {
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
  const supabase = createOptionalClient()
  if (!supabase) return []

  const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false })

  if (error) return []
  return ((data as DbClient[]) || []).map(transformDbClient)
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
