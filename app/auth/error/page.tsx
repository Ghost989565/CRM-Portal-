import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20">
              <AlertTriangle className="h-8 w-8 text-rose-300" />
            </div>
            <CardTitle className="text-2xl text-white">Authentication Error</CardTitle>
            <CardDescription className="text-white/70">Something went wrong</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-white/80">{searchParams.error || "Please try again."}</p>
            <Button asChild className="w-full bg-cyan-500 text-slate-900 hover:bg-cyan-400">
              <Link href="/auth/login">Try again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
