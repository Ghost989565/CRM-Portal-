import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Shield } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CRM Portal</h1>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-xl text-white">Authentication Error</CardTitle>
            <CardDescription className="text-white/60">
              Something went wrong during authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-white/80 text-center">
                This could happen if the confirmation link has expired, 
                was already used, or is invalid. Please try signing in again 
                or request a new confirmation email.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full bg-white text-slate-900 hover:bg-white/90">
              <Link href="/auth/login">
                Back to sign in
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10">
              <Link href="/auth/sign-up">
                Create new account
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
