import { Loader2 } from "lucide-react"

export default function PortalLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-white font-medium">Loading portal...</p>
          <p className="text-white/60 text-sm">Please wait</p>
        </div>
      </div>
    </div>
  )
}
