import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/20">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl text-white">
                Authentication Error
              </CardTitle>
              <CardDescription className="text-white/60">
                Something went wrong
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {params?.error ? (
                <p className="text-center text-sm text-white/70">
                  Error: {params.error}
                </p>
              ) : (
                <p className="text-center text-sm text-white/70">
                  An unspecified error occurred during authentication.
                </p>
              )}
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                <Link href="/auth/login">
                  Try again
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
