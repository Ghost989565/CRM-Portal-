"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

const features = [
  "Smart lead tracking and pipeline visibility",
  "Shared teammate calendars and request workflows",
  "Performance dashboards with actionable insights",
  "Script and resource library for faster onboarding",
]

export default function HomePage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<string | null>(null)

  const trialEndDate = useMemo(() => {
    const end = new Date()
    end.setDate(end.getDate() + 14)
    return end.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!firstName || !lastName || !email || !company) {
      setError("Please fill out all fields.")
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setError("")
    setSuccess(`Welcome ${firstName}! Your 14-day free trial is active through ${trialEndDate}.`)

    localStorage.setItem(
      "pantheon_trial_user",
      JSON.stringify({
        firstName,
        lastName,
        email,
        company,
        trialStart: new Date().toISOString(),
        trialEnd: trialEndDate,
      }),
    )
  }

  return (
    <main className="min-h-screen bg-[#f8f7f3] text-[#1f2a37]">
      <section className="relative overflow-hidden px-6 py-16 md:px-10 md:py-20">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#00b894]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#ffb347]/25 blur-3xl" />

        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="inline-block rounded-full bg-[#1f2a37] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white">
              Pantheon CRM
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Build your pipeline with a CRM your team will actually love.
            </h1>
            <p className="max-w-xl text-base text-[#334155] md:text-lg">
              Organize clients, automate follow-up, and keep your team in sync. Start your 14-day free trial now.
            </p>
            <ul className="space-y-2 text-sm text-[#334155] md:text-base">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#00b894]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-xl backdrop-blur md:p-8">
            <h2 className="text-2xl font-semibold">Start your free trial</h2>
            <p className="mt-2 text-sm text-[#475569]">No credit card required. Full access for 14 days.</p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00b894]"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                  className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00b894]"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <input
                className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00b894]"
                placeholder="Work email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00b894]"
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

              <button
                type="submit"
                className="w-full rounded-xl bg-[#1f2a37] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#111827]"
              >
                Activate My 14-Day Trial
              </button>
            </form>

            <button
              type="button"
              className="mt-4 w-full rounded-xl border border-[#cbd5e1] px-4 py-3 text-sm font-medium text-[#1f2a37] transition hover:bg-[#f1f5f9]"
              onClick={() => router.push("/portal")}
            >
              Continue to Portal
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
