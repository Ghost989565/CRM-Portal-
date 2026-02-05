import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Mail, Shield } from "lucide-react"

export default function SignUpSuccessPage() {
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
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <CardTitle className="text-xl text-white">Check your email</CardTitle>
            <CardDescription className="text-white/60">
              {"We've sent you a confirmation link"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <Mail className="w-5 h-5 text-white/70 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-white/80">
                <p>
                  Please check your email inbox and click the confirmation link to activate your account.
                </p>
                <p className="mt-2 text-white/60">
                  {"If you don't see the email, check your spam folder."}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-white text-slate-900 hover:bg-white/90">
              <Link href="/auth/login">
                Back to sign in
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
