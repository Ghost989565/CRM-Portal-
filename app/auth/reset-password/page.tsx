"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createOptionalClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const supabase = createOptionalClient()
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session))
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    const supabase = createOptionalClient()
    if (!supabase) {
      setError("Supabase is not configured yet. Add env vars to enable password reset.")
      return
    }

    setIsLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      router.push("/auth/login?reset=success")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Choose a new password</CardTitle>
            <CardDescription className="text-white/70">Use the password reset link from your email first.</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasSession ? (
              <div className="space-y-4">
                <p className="text-sm text-amber-300">
                  Open this page from the reset link sent to your email so we can verify your request.
                </p>
                <Link href="/auth/forgot-password" className="text-sm text-cyan-300 hover:underline">
                  Request a new reset link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-white/20 bg-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white/80">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-white/20 bg-white/10 text-white"
                  />
                </div>

                {error ? <p className="text-sm text-rose-300">{error}</p> : null}

                <Button type="submit" disabled={isLoading} className="w-full bg-cyan-500 text-slate-900 hover:bg-cyan-400">
                  {isLoading ? "Updating..." : "Update password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
