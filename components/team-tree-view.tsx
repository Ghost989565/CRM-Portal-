"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Users, UserPlus, TrendingUp, Copy, Check } from "lucide-react"
import type { TeamMember, TeamStats, Profile } from "@/lib/types/database"

interface TeamMemberCardProps {
  member: TeamMember
  isCurrentUser?: boolean
  highlight?: "upline" | "downline" | "self"
}

function TeamMemberCard({ member, isCurrentUser, highlight }: TeamMemberCardProps) {
  const initials = `${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`.toUpperCase() || "?"
  const fullName = [member.first_name, member.last_name].filter(Boolean).join(" ") || "Unknown"
  
  const highlightStyles = {
    upline: "border-l-4 border-l-blue-500 bg-blue-50/50",
    downline: "border-l-4 border-l-green-500 bg-green-50/50",
    self: "border-l-4 border-l-accent bg-accent/10 ring-2 ring-accent/20"
  }
  
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg bg-card border ${highlight ? highlightStyles[highlight] : ""}`}>
      <Avatar className="h-10 w-10">
        <AvatarImage src={member.avatar_url || undefined} alt={fullName} />
        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {fullName}
          {isCurrentUser && <span className="text-muted-foreground text-sm ml-2">(You)</span>}
        </p>
        <p className="text-sm text-muted-foreground truncate">{member.title || "Agent"}</p>
      </div>
      {highlight === "upline" && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">Upline</Badge>
      )}
      {highlight === "downline" && (
        <Badge variant="secondary" className="bg-green-100 text-green-700">Recruit</Badge>
      )}
    </div>
  )
}

interface TreeNodeProps {
  member: TeamMember
  children?: TeamMember[]
  allMembers: TeamMember[]
  defaultExpanded?: boolean
}

function TreeNode({ member, allMembers, defaultExpanded = false }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const children = allMembers.filter(m => m.referred_by === member.id)
  const hasChildren = children.length > 0
  
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
        {!hasChildren && <div className="w-6" />}
        <div className="flex-1">
          <TeamMemberCard member={member} highlight="downline" />
        </div>
      </div>
      
      {hasChildren && expanded && (
        <div className="ml-8 mt-2 space-y-2 border-l-2 border-border pl-4">
          {children.map(child => (
            <TreeNode
              key={child.id}
              member={child}
              allMembers={allMembers}
              defaultExpanded={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TeamStatsCardsProps {
  stats: TeamStats | null
}

function TeamStatsCards({ stats }: TeamStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <UserPlus className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.direct_recruits || 0}</p>
              <p className="text-sm text-muted-foreground">Direct Recruits</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.total_team_size || 0}</p>
              <p className="text-sm text-muted-foreground">Total Team Size</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-accent/20">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.team_depth || 0}</p>
              <p className="text-sm text-muted-foreground">Team Depth</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ReferralCodeCardProps {
  referralCode: string | null
}

function ReferralCodeCard({ referralCode }: ReferralCodeCardProps) {
  const [copied, setCopied] = useState(false)
  
  const copyToClipboard = async () => {
    if (!referralCode) return
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const link = `${baseUrl}/auth/sign-up?ref=${referralCode}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Referral Code</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-2xl font-mono font-bold tracking-wider text-foreground">
              {referralCode || "N/A"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Share this code to grow your team
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={!referralCode}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface TeamTreeViewProps {
  currentUser: Profile
  upline: TeamMember[]
  downline: TeamMember[]
  stats: TeamStats | null
}

export function TeamTreeView({ currentUser, upline, downline, stats }: TeamTreeViewProps) {
  const currentUserAsMember: TeamMember = {
    id: currentUser.id,
    first_name: currentUser.first_name,
    last_name: currentUser.last_name,
    email: currentUser.email,
    title: currentUser.title,
    avatar_url: currentUser.avatar_url,
    depth: 0
  }
  
  // Get direct recruits (depth 1 in downline)
  const directRecruits = downline.filter(m => m.depth === 1)
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <TeamStatsCards stats={stats} />
      
      {/* Referral Code */}
      <ReferralCodeCard referralCode={currentUser.referral_code} />
      
      {/* Organization Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Your Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upline Section */}
          {upline.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                Upline (Your Leadership)
              </h3>
              <div className="space-y-2 mb-4">
                {[...upline].reverse().map((member, index) => (
                  <div key={member.id} style={{ marginLeft: `${index * 24}px` }}>
                    <TeamMemberCard member={member} highlight="upline" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Current User */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent" />
              You
            </h3>
            <div style={{ marginLeft: upline.length > 0 ? `${upline.length * 24}px` : "0px" }}>
              <TeamMemberCard member={currentUserAsMember} isCurrentUser highlight="self" />
            </div>
          </div>
          
          {/* Downline Section */}
          {directRecruits.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                Downline (Your Recruits)
              </h3>
              <div className="space-y-2" style={{ marginLeft: upline.length > 0 ? `${(upline.length + 1) * 24}px` : "24px" }}>
                {directRecruits.map(member => (
                  <TreeNode
                    key={member.id}
                    member={member}
                    allMembers={downline}
                    defaultExpanded={true}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {upline.length === 0 && directRecruits.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>You're the start of your organization!</p>
              <p className="text-sm mt-1">Share your referral code to start building your team.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
