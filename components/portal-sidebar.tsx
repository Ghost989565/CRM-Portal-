"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, Users, FileText, BookOpen, Settings, Menu, X, LogOut, Network } from "lucide-react"
import type { User } from "@supabase/supabase-js"

const navigation = [
  { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { name: "My Team", href: "/portal/team", icon: Network },
  { name: "Calendars", href: "/portal/calendars", icon: Calendar },
  { name: "Clients", href: "/portal/clients", icon: Users },
  { name: "Scripts", href: "/portal/scripts", icon: FileText },
  { name: "Resources", href: "/portal/resources", icon: BookOpen },
  { name: "Settings", href: "/portal/settings", icon: Settings },
]

export function PortalSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const getUserInitials = () => {
    if (!user) return "?"
    const firstName = user.user_metadata?.first_name || ""
    const lastName = user.user_metadata?.last_name || ""
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    return user.email?.[0]?.toUpperCase() || "?"
  }

  const getUserName = () => {
    if (!user) return "Loading..."
    const firstName = user.user_metadata?.first_name
    const lastName = user.user_metadata?.last_name
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    return user.email?.split("@")[0] || "User"
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/95 backdrop-blur"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        data-calendar-sidebar
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <Link href="/portal" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-sidebar-primary">SFS</span>
            </Link>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {getUserName()}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-sidebar-foreground hover:bg-white/5 hover:text-white",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Sign out button */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-white/5 hover:text-white"
              onClick={handleSignOut}
              disabled={loading}
            >
              <LogOut className="mr-3 h-5 w-5" />
              {loading ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  )
}
