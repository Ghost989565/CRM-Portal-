"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to portal - middleware will handle auth when Supabase is configured
    router.push("/portal")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="text-center">
        <span className="text-4xl font-bold text-white mb-4 block">SFS</span>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto" />
        <p className="mt-4 text-white/60">Loading...</p>
      </div>
    </div>
  )
}
