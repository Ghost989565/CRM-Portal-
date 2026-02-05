"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Calendar,
  UserPlus,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { useClients } from "@/hooks/use-clients"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { Client } from "@/lib/crm-data"

// Fetch appointments from Supabase
async function fetchAppointments() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("appointments")
    .select("*, clients(first_name, last_name)")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(5)
  
  if (error) throw error
  return data || []
}

// Fetch recent contact logs
async function fetchRecentContacts() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("contact_logs")
    .select("*, clients(first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(5)
  
  if (error) throw error
  return data || []
}

export function PipelineCard() {
  const { clients, isLoading } = useClients()
  
  const pipelineData = [
    { status: "New Lead", label: "New", color: "bg-blue-500" },
    { status: "Working", label: "Working", color: "bg-yellow-500" },
    { status: "Presentation Set", label: "Appt Set", color: "bg-purple-500" },
    { status: "Follow-Up", label: "Follow-Up", color: "bg-orange-500" },
  ]

  const getCount = (status: string) => clients.filter(c => c.status === status).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          My Pipeline
        </CardTitle>
        <CardDescription>Current status of all prospects ({clients.length} total)</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {pipelineData.map((item) => (
              <div key={item.status} className="text-center space-y-2">
                <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mx-auto border-0 shadow-lg`}>
                  <span className="text-white font-bold text-lg">{getCount(item.status)}</span>
                </div>
                <p className="text-sm font-medium text-white">{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function FollowUpsCard() {
  const { clients, isLoading } = useClients()
  
  // Get clients with "Follow-Up" status
  const followUps = clients.filter(c => c.status === "Follow-Up").slice(0, 5)

  const handleAction = (action: string, client: Client) => {
    if (action === "call") {
      window.open(`tel:${client.phone}`)
    } else if (action === "text") {
      window.open(`sms:${client.phone}`)
    } else if (action === "email") {
      window.open(`mailto:${client.email}?subject=SFS%20Follow-up`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Follow-Ups Needed
        </CardTitle>
        <CardDescription>Clients that need attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : followUps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No follow-ups needed</p>
        ) : (
          followUps.map((client) => (
            <div key={client.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{client.firstName} {client.lastName}</p>
                  <Badge variant="secondary">{client.stage}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{client.phone || client.email || "No contact info"}</p>
              </div>
              <div className="flex space-x-1">
                <Button size="sm" variant="ghost" onClick={() => handleAction("call", client)} className="h-8 w-8 p-0">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleAction("text", client)} className="h-8 w-8 p-0">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleAction("email", client)} className="h-8 w-8 p-0">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function AppointmentsCard() {
  const { data: appointments, isLoading } = useSWR("appointments", fetchAppointments, {
    revalidateOnFocus: false,
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Upcoming Appointments
        </CardTitle>
        <CardDescription>Next scheduled meetings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !appointments || appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments</p>
        ) : (
          appointments.map((appointment: any) => (
            <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {appointment.clients 
                      ? `${appointment.clients.first_name?.[0] || ""}${appointment.clients.last_name?.[0] || ""}`
                      : appointment.title?.[0] || "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {appointment.clients 
                      ? `${appointment.clients.first_name} ${appointment.clients.last_name}`
                      : appointment.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{appointment.type || "Meeting"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatDate(appointment.start_time)}</p>
                <p className="text-sm text-muted-foreground">{formatTime(appointment.start_time)}</p>
                {appointment.location && (
                  <p className="text-xs text-muted-foreground">{appointment.location}</p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function RecentContactsCard() {
  const { data: contacts, isLoading } = useSWR("recent-contacts", fetchRecentContacts, {
    revalidateOnFocus: false,
  })

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return "Just now"
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case "call": return "Called"
      case "text": return "Texted"
      case "email": return "Emailed"
      case "meeting": return "Met with"
      default: return "Contacted"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Recently Contacted
        </CardTitle>
        <CardDescription>Timeline of recent client interactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !contacts || contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent contacts</p>
        ) : (
          contacts.map((contact: any) => (
            <div key={contact.id} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {contact.clients 
                      ? `${contact.clients.first_name} ${contact.clients.last_name}`
                      : "Unknown Client"}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatTime(contact.created_at)}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getActionIcon(contact.type)} - {contact.outcome || "Completed"}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function QuickLinksCard() {
  const quickLinks = [
    { name: "Create Client", icon: UserPlus, href: "/portal/clients?action=create" },
    { name: "Log Contact", icon: Phone, href: "/portal/clients?action=log" },
    { name: "New Appointment", icon: Calendar, href: "/portal/calendars?action=create" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Quick Links
        </CardTitle>
        <CardDescription>Common actions and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
            <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Button
              key={link.name}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent border-white/20 hover:bg-white/10 hover:border-white/30 text-white"
              asChild
            >
              <a href={link.href}>
                <link.icon className="h-6 w-6" />
                <span className="text-sm">{link.name}</span>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
