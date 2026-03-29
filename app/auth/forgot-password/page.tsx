"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createOptionalClient } from "@/lib/supabase/client"

function getFriendlyAuthError(err: unknown, fallback: string) {
  if (err instanceof Error) {
    const message = err.message || fallback
    const normalized = message.toLowerCase()

    if (normalized.includes("load failed") || normalized.includes("failed to fetch")) {
      return "Unable to reach Supabase. Confirm NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Netlify Production, then redeploy."
    }
    if (normalized.includes("invalid api key") || normalized.includes("api key")) {
      return "Supabase key is invalid. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY uses the anon key (role: anon)."
    }
    if (normalized.includes("redirect") && normalized.includes("allow")) {
      return "Supabase redirect URL is blocked. In Supabase Auth URL Configuration, allow your site URL and /auth/reset-password."
    }
    return message
  }

  return fallback
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    const supabase = createOptionalClient()
    if (!supabase) {
      setError("Supabase is not configured yet. Add env vars to enable password reset.")
      return
    }

    setIsLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (resetError) throw resetError
      setMessage("If an account exists for this email, we sent a reset link.")
    } catch (err: unknown) {
      setError(getFriendlyAuthError(err, "Unable to send reset email"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Reset your password</CardTitle>
            <CardDescription className="text-white/70">Enter your email and we will send a reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-white/20 bg-white/10 text-white"
                />
              </div>

              {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
              {error ? <p className="text-sm text-rose-300">{error}</p> : null}

              <Button type="submit" disabled={isLoading} className="w-full bg-cyan-500 text-slate-900 hover:bg-cyan-400">
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>

              <p className="text-center text-sm text-white/70">
                Back to{" "}
                <Link href="/auth/login" className="text-cyan-300 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
