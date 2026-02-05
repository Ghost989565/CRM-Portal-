import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl font-bold text-white">SFS</span>
            <span className="text-sm text-white/60">CRM Portal</span>
          </div>
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/20">
                <Mail className="h-8 w-8 text-indigo-400" />
              </div>
              <CardTitle className="text-2xl text-white">
                Check your email
              </CardTitle>
              <CardDescription className="text-white/60">
                We sent you a confirmation link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-white/70">
                Click the link in your email to verify your account and get started with SFS CRM.
              </p>
              <Button asChild variant="outline" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10">
                <Link href="/auth/login">
                  Back to sign in
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
