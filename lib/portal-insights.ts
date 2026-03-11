import type { Client } from "@/lib/crm-data"
import type { ContactLogEntry } from "@/contexts/contact-logs-context"
import type { ChartDataPoint, PerformanceMetric } from "@/lib/performance-data"

export interface CalendarEventSummary {
  id: string
  title: string
  startTime: string
  endTime: string
  date: string
  description?: string
  location?: string
  attendees?: string[]
}

export interface FollowUpItem {
  id: string
  name: string
  phone: string
  email: string
  reason: string
  priority: "high" | "medium" | "low"
}

export interface AppointmentItem {
  id: string
  client: string
  type: string
  date: string
  time: string
  location: string
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function parseEventDate(event: CalendarEventSummary): Date | null {
  const raw = `${event.date}T${event.startTime || "00:00"}`
  return parseDate(raw)
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number)
  return new Date(year, (month || 1) - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  })
}

function toPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.round(value))
}

export function buildPipelineCounts(
  clients: Client[],
  contactedThisWeekCount: number,
  events: CalendarEventSummary[]
): Record<string, number> {
  const now = new Date()
  const upcomingAppointments = events.filter((event) => {
    const date = parseEventDate(event)
    return !!date && date >= now
  }).length

  return {
    New: clients.filter((client) => client.status === "New Lead").length,
    Contacted: contactedThisWeekCount,
    "Appt Set": upcomingAppointments,
    Presented: clients.filter((client) =>
      client.stage === "Proposal" || client.stage === "Negotiation" || client.stage === "Closed Won"
    ).length,
    "Follow-Up": clients.filter((client) => client.status === "Follow-Up").length,
  }
}

export function buildFollowUps(clients: Client[], logs: ContactLogEntry[]): FollowUpItem[] {
  const lastLogMap = new Map<string, ContactLogEntry>()
  logs.forEach((log) => {
    if (!lastLogMap.has(log.clientId)) lastLogMap.set(log.clientId, log)
  })

  return clients
    .filter((client) => client.status === "Follow-Up" || client.stage === "Negotiation" || client.stage === "Proposal")
    .map((client) => {
      const lastLog = lastLogMap.get(client.id)
      const lastContact = parseDate(client.lastContact) ?? parseDate(lastLog?.timestamp)
      const daysSinceContact = lastContact
        ? Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
        : 999
      const priority: FollowUpItem["priority"] =
        client.stage === "Negotiation" || daysSinceContact >= 14
          ? "high"
          : daysSinceContact >= 7 || client.status === "Follow-Up"
            ? "medium"
            : "low"

      const reason =
        client.stage === "Negotiation"
          ? "Deal in negotiation"
          : client.stage === "Proposal"
            ? "Proposal needs follow-up"
            : daysSinceContact >= 999
              ? "No contact logged yet"
              : `Last contacted ${daysSinceContact} day${daysSinceContact === 1 ? "" : "s"} ago`

      return {
        id: client.id,
        name: `${client.firstName} ${client.lastName}`.trim(),
        phone: client.phone,
        email: client.email,
        reason,
        priority,
      }
    })
    .sort((a, b) => {
      const score = { high: 0, medium: 1, low: 2 }
      return score[a.priority] - score[b.priority]
    })
    .slice(0, 5)
}

export function buildUpcomingAppointments(events: CalendarEventSummary[]): AppointmentItem[] {
  const now = new Date()
  return events
    .map((event) => {
      const start = parseEventDate(event)
      return start ? { event, start } : null
    })
    .filter((item): item is { event: CalendarEventSummary; start: Date } => !!item && item.start >= now)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5)
    .map(({ event, start }) => ({
      id: String(event.id),
      client: event.attendees?.[0] || event.title,
      type: event.title,
      date: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      location: event.location || "No location",
    }))
}

export function buildPerformanceMetrics(
  clients: Client[],
  logs: ContactLogEntry[],
  events: CalendarEventSummary[]
): PerformanceMetric[] {
  const now = new Date()
  const currentMonth = monthKey(now)
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonth = monthKey(previousMonthDate)

  const clientsThisMonth = clients.filter((client) => monthKey(parseDate(client.createdAt) ?? now) === currentMonth).length
  const clientsLastMonth = clients.filter((client) => monthKey(parseDate(client.createdAt) ?? now) === previousMonth).length

  const monthlyLogs = logs.filter((log) => monthKey(parseDate(log.timestamp) ?? now) === currentMonth)
  const previousMonthlyLogs = logs.filter((log) => monthKey(parseDate(log.timestamp) ?? now) === previousMonth)

  const currentMonthEvents = events.filter((event) => {
    const date = parseEventDate(event)
    return !!date && monthKey(date) === currentMonth
  }).length
  const previousMonthEvents = events.filter((event) => {
    const date = parseEventDate(event)
    return !!date && monthKey(date) === previousMonth
  }).length

  const closedWon = clients.filter((client) => client.stage === "Closed Won").length
  const closedLost = clients.filter((client) => client.stage === "Closed Lost").length
  const closeRate = closedWon + closedLost > 0 ? (closedWon / (closedWon + closedLost)) * 100 : 0

  const activePipeline = clients.filter(
    (client) => client.stage !== "Closed Won" && client.stage !== "Closed Lost" && client.status !== "Do Not Contact"
  ).length
  const followUpCount = clients.filter((client) => client.status === "Follow-Up").length

  const percentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const metrics: PerformanceMetric[] = [
    {
      id: "new-clients",
      name: "New Clients",
      value: clientsThisMonth,
      target: Math.max(10, clientsThisMonth + 3),
      period: "monthly",
      trend: clientsThisMonth >= clientsLastMonth ? "up" : "down",
      trendPercentage: percentChange(clientsThisMonth, clientsLastMonth),
      category: "sales",
    },
    {
      id: "client-touches",
      name: "Client Touches",
      value: monthlyLogs.length,
      target: Math.max(25, monthlyLogs.length + 10),
      period: "monthly",
      trend: monthlyLogs.length >= previousMonthlyLogs.length ? "up" : "down",
      trendPercentage: percentChange(monthlyLogs.length, previousMonthlyLogs.length),
      category: "activity",
    },
    {
      id: "appointments-set",
      name: "Appointments Set",
      value: currentMonthEvents,
      target: Math.max(8, currentMonthEvents + 4),
      period: "monthly",
      trend: currentMonthEvents >= previousMonthEvents ? "up" : "down",
      trendPercentage: percentChange(currentMonthEvents, previousMonthEvents),
      category: "activity",
    },
    {
      id: "active-pipeline",
      name: "Active Pipeline",
      value: activePipeline,
      target: Math.max(15, activePipeline + 5),
      period: "monthly",
      trend: activePipeline > 0 ? "up" : "stable",
      trendPercentage: 0,
      category: "sales",
    },
    {
      id: "close-rate",
      name: "Close Rate",
      value: toPercent(closeRate),
      target: 35,
      period: "monthly",
      trend: closeRate >= 35 ? "up" : closeRate > 0 ? "stable" : "down",
      trendPercentage: 0,
      category: "sales",
    },
    {
      id: "follow-ups",
      name: "Follow-Up Rate",
      value: clients.length > 0 ? toPercent((followUpCount / clients.length) * 100) : 0,
      target: 25,
      period: "monthly",
      trend: followUpCount > 0 ? "up" : "stable",
      trendPercentage: 0,
      category: "retention",
    },
  ]

  return metrics
}

export function buildChartData(
  clients: Client[],
  logs: ContactLogEntry[],
  events: CalendarEventSummary[]
): {
  chartData: Record<string, ChartDataPoint[]>
  activityData: Array<{ date: string; calls: number; emails: number; appointments: number; presentations: number }>
  comparisonData: Array<{ name: string; actual: number; target: number }>
} {
  const months = new Map<string, { clients: number; events: number; closedWon: number; closedLost: number }>()
  const daily = new Map<string, { calls: number; emails: number; appointments: number; presentations: number }>()

  clients.forEach((client) => {
    const created = parseDate(client.createdAt)
    if (!created) return
    const key = monthKey(created)
    const current = months.get(key) ?? { clients: 0, events: 0, closedWon: 0, closedLost: 0 }
    current.clients += 1
    if (client.stage === "Closed Won") current.closedWon += 1
    if (client.stage === "Closed Lost") current.closedLost += 1
    months.set(key, current)
  })

  events.forEach((event) => {
    const start = parseEventDate(event)
    if (!start) return
    const key = monthKey(start)
    const current = months.get(key) ?? { clients: 0, events: 0, closedWon: 0, closedLost: 0 }
    current.events += 1
    months.set(key, current)

    const dayKey = start.toISOString().slice(0, 10)
    const day = daily.get(dayKey) ?? { calls: 0, emails: 0, appointments: 0, presentations: 0 }
    day.appointments += 1
    daily.set(dayKey, day)
  })

  logs.forEach((log) => {
    const date = parseDate(log.timestamp)
    if (!date) return
    const dayKey = date.toISOString().slice(0, 10)
    const day = daily.get(dayKey) ?? { calls: 0, emails: 0, appointments: 0, presentations: 0 }
    if (log.action === "call") day.calls += 1
    if (log.action === "email") day.emails += 1
    if (log.action === "text") day.presentations += 1
    daily.set(dayKey, day)
  })

  const sortedMonths = [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6)
  const chartData = {
    "apps-submitted": sortedMonths.map(([key, values]) => ({
      date: monthLabel(key),
      value: values.clients,
      target: Math.max(10, values.clients + 2),
    })),
    "premium-volume": sortedMonths.map(([key, values]) => ({
      date: monthLabel(key),
      value: values.events * 250,
      target: Math.max(1000, values.events * 250 + 500),
    })),
    "close-rate": sortedMonths.map(([key, values]) => ({
      date: monthLabel(key),
      value: values.closedWon + values.closedLost > 0 ? toPercent((values.closedWon / (values.closedWon + values.closedLost)) * 100) : 0,
      target: 35,
    })),
  }

  const activityData = [...daily.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([key, value]) => ({
      date: new Date(`${key}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      ...value,
    }))

  const comparisonData = [
    { name: "Clients", actual: chartData["apps-submitted"].at(-1)?.value ?? 0, target: chartData["apps-submitted"].at(-1)?.target ?? 10 },
    { name: "Meetings", actual: Math.round((chartData["premium-volume"].at(-1)?.value ?? 0) / 250), target: Math.round((chartData["premium-volume"].at(-1)?.target ?? 1000) / 250) },
    { name: "Close Rate", actual: chartData["close-rate"].at(-1)?.value ?? 0, target: chartData["close-rate"].at(-1)?.target ?? 35 },
  ]

  return { chartData, activityData, comparisonData }
}
