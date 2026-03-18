"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { usePathname } from "next/navigation"
import { PortalSidebar } from "@/components/portal-sidebar"
import { BeamsBackground } from "@/components/ui/beams-background"
import { useSidebar } from "@/contexts/sidebar-context"

interface PortalLayoutProps {
  children: React.ReactNode
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const pathname = usePathname()
  const [isLoaded, setIsLoaded] = useState(false)
  const { isCollapsed } = useSidebar()

  useEffect(() => {
    setIsLoaded(false)
    const timer = setTimeout(() => setIsLoaded(true), 50)
    return () => clearTimeout(timer)
  }, [pathname])

  const sidebarWidth = isCollapsed ? "w-16" : "w-56"

  return (
    <BeamsBackground intensity="medium" className="portal-shell text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(34,197,94,0.08),transparent_24%),linear-gradient(180deg,rgba(7,10,18,0.18),rgba(7,10,18,0.58))]" />

      <div className={`fixed left-0 top-0 z-50 portal-sidebar-wrapper ${sidebarWidth} h-screen pointer-events-none transition-all duration-300 ease-in-out`}>
        <div className="portal-sidebar-surface pointer-events-auto h-full w-full border-r border-white/10 bg-slate-950/58 backdrop-blur-xl">
          <PortalSidebar />
        </div>
      </div>

      <div
        className={`portal-main-surface relative z-10 min-h-screen lg:transition-all duration-300 ease-in-out ${isCollapsed ? "lg:pl-16" : "lg:pl-56"}`}
      >
        <main
          key={pathname}
          className={`min-h-screen p-6 lg:p-8 transition-opacity duration-300 ${isLoaded ? "animate-fade-in opacity-100" : "opacity-100"}`}
        >
          {children}
        </main>
      </div>
    </BeamsBackground>
  )
}
