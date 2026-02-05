import { redirect } from "next/navigation"
import { PortalLayout } from "@/components/portal-layout"
import { TeamTreeView } from "@/components/team-tree-view"
import { getCurrentUserProfile, getUpline, getDownline, getTeamStats } from "@/lib/actions/team"

export default async function TeamPage() {
  const profile = await getCurrentUserProfile()
  
  if (!profile) {
    redirect("/auth/login")
  }
  
  // Fetch all team data in parallel
  const [upline, downline, stats] = await Promise.all([
    getUpline(profile.id),
    getDownline(profile.id),
    getTeamStats(profile.id)
  ])
  
  return (
    <PortalLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Team</h1>
          <p className="text-muted-foreground">
            View your organization tree, track your recruits, and grow your team.
          </p>
        </div>

        {/* Team Tree View */}
        <TeamTreeView
          currentUser={profile}
          upline={upline}
          downline={downline}
          stats={stats}
        />
      </div>
    </PortalLayout>
  )
}
