 "use client"

import { PortalLayout } from "@/components/portal-layout"
import {
  PipelineCard,
  FollowUpsCard,
  AppointmentsCard,
  RecentContactsCard,
  QuickLinksCard,
} from "@/components/dashboard-cards"
import { useEffect, useState } from "react"
import { createOptionalClient } from "@/lib/supabase/client"

export default function PortalDashboard() {
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const supabase = createOptionalClient()
    if (!supabase) return

    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        if (user?.user_metadata?.first_name) {
          setUserName(user.user_metadata.first_name)
          return
        }

        if (user?.email) {
          setUserName(user.email.split("@")[0])
        }
      })
      .catch(() => {
        // ignore and keep default heading
      })
  }, [])

  return (
    <PortalLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{userName ? `Welcome back, ${userName}!` : "Dashboard"}</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your clients.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6">
          {/* Pipeline Overview - Full Width */}
          <PipelineCard />

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            <FollowUpsCard />
            <AppointmentsCard />
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            <RecentContactsCard />
            <QuickLinksCard />
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
