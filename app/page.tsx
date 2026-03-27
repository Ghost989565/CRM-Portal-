"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  Rocket,
  Target,
  CalendarCheck2,
  BarChart3,
  FileText,
  BookOpen,
  MessageSquare,
} from "lucide-react"
import { MeshGradientSVG } from "@/components/mesh-gradient-svg"

type Feature = {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const coreFeatures: Feature[] = [
  {
    title: "Client Pipeline & Status Tracking",
    description:
      "Move leads through clear stages like Prospect, Qualified, Proposal, and Closed Won while keeping every touchpoint organized.",
    icon: Target,
  },
  {
    title: "Calendar & Team Availability",
    description:
      "Coordinate appointments, request teammate time slots, and avoid scheduling conflicts with visibility into shared calendars.",
    icon: CalendarCheck2,
  },
  {
    title: "Performance Dashboards",
    description:
      "Track activity and sales metrics in one place so managers and agents can spot momentum and bottlenecks fast.",
    icon: BarChart3,
  },
  {
    title: "Scripts & Templates Library",
    description:
      "Use ready-to-run cold call, follow-up, objection handling, presentation, recruiting, and email scripts to improve consistency.",
    icon: FileText,
  },
  {
    title: "Training Modules",
    description:
      "Onboard and level up faster with guided modules for Licensing, CFT, and Appointment training with structured lessons.",
    icon: BookOpen,
  },
  {
    title: "Client Notes & Contact History",
    description:
      "Capture calls, texts, emails, and meeting outcomes so your team always has context before the next conversation.",
    icon: MessageSquare,
  },
]

const trialIncludes = [
  "Full access to all CRM pages and tools",
  "Unlimited exploration of pipeline, calendars, scripts, and performance dashboards",
  "No credit card required",
  "Instant account activation in under 60 seconds",
]

const trustStats = [
  { label: "Teams onboarded", value: "500+" },
  { label: "Clients tracked", value: "12K+" },
  { label: "Trial-to-active rate", value: "98%" },
  { label: "Full-access trial", value: "14 days" },
]

export default function HomePage() {
  const router = useRouter()
  const formRef = useRef<HTMLDivElement | null>(null)
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null)
  const successTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isActivated, setIsActivated] = useState(false)

  const trialEndDate = useMemo(() => {
    const end = new Date()
    end.setDate(end.getDate() + 14)
    return end.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [])

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current)
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    }
  }, [])

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting || isActivated) return

    if (!firstName || !lastName || !email || !company) {
      setError("Please fill out all fields.")
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setError("")
    setSuccess(null)
    setIsSubmitting(true)

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

    successTimerRef.current = setTimeout(() => {
      setIsSubmitting(false)
      setIsActivated(true)
      setSuccess(`Welcome ${firstName}! Your Pantheon trial is active through ${trialEndDate}.`)

      redirectTimerRef.current = setTimeout(() => {
        router.push("/portal")
      }, 1800)
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-[#0e1218] text-[#e5edf6]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#22d3ee22,_transparent_45%),radial-gradient(circle_at_90%_20%,_#22c55e1f,_transparent_35%),radial-gradient(circle_at_50%_100%,_#f59e0b1a,_transparent_40%)]" />

        <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-10 md:pb-24">
          <header className="sticky top-3 z-40 mb-16 flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f172acc] px-5 py-4 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Pantheon CRM</p>
              <p className="text-sm text-slate-300">Built for high-performance teams</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/portal")}
              className="inline-flex items-center rounded-lg border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-300/10"
            >
              Open Portal
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </header>

          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative">
              <p className="mb-4 inline-flex rounded-full border border-emerald-300/40 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
                14-Day Free Trial - No Card Required
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                Know exactly what your team did today, what is next, and what closes this week.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-slate-300">
                Pantheon is not just a contact list. It is your pipeline command center, appointment engine, script library, and performance dashboard in one platform.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {trialIncludes.map((item) => (
                  <div key={item} className="flex items-start rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                    <span className="mr-3 mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 block">
                <MeshGradientSVG />
              </div>
            </div>

            <aside
              ref={formRef}
              className="rounded-3xl border border-cyan-300/20 bg-[#111a24]/90 p-6 shadow-[0_0_60px_rgba(34,211,238,0.07)] backdrop-blur md:p-8"
            >
              <h2 className="text-2xl font-semibold text-white">Start your trial now</h2>
              <p className="mt-2 text-sm text-slate-300">Get full Pantheon access instantly. Trial end date: {trialEndDate}.</p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                    Work Email
                  </label>
                  <input
                    id="email"
                    className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                    placeholder="john@company.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="company" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                    Company
                  </label>
                  <input
                    id="company"
                    className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                    placeholder="Acme Insurance"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                {error ? <p className="text-sm text-rose-300">{error}</p> : null}
                {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

                <button
                  type="submit"
                  disabled={isSubmitting || isActivated}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-[#07203a] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Activating...
                    </>
                  ) : isActivated ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Activated!
                    </>
                  ) : (
                    <>
                      Activate Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span>By starting, you can immediately explore all major product areas in the portal.</span>
                <button
                  type="button"
                  onClick={() => router.push("/portal")}
                  className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
                >
                  Already have access?
                </button>
              </div>
            </aside>
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-7xl px-6 pb-6 md:px-10">
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-4">
          {trustStats.map((stat) => (
            <article key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-300">{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10 md:px-10">
        <h3 className="text-2xl font-semibold text-white md:text-3xl">What you are getting access to</h3>
        <p className="mt-2 max-w-3xl text-slate-300">
          The free trial includes the same core product experience your team would use daily after rollout.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {coreFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-300/40 hover:bg-white/[0.06]"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-lg font-semibold text-white">{feature.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{feature.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-400/20 via-emerald-400/10 to-amber-300/20 p-8 md:p-10">
          <h3 className="text-3xl font-semibold text-white">Start now, evaluate fast, decide with confidence.</h3>
          <p className="mt-3 max-w-2xl text-slate-200">
            In 14 days, your team can test lead workflow, appointments, scripts, onboarding content, and performance reporting in one environment.
          </p>
          <button
            type="button"
            onClick={scrollToForm}
            className="mt-6 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f172a] transition hover:bg-slate-200"
          >
            Claim Your Free Trial
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#0b0f14]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-sm text-slate-400 md:px-10">
          <p className="inline-flex items-center">
            <Rocket className="mr-2 h-4 w-4 text-cyan-300" />
            Pantheon CRM
          </p>
          <p className="inline-flex items-center">
            <Clock3 className="mr-2 h-4 w-4" />
            © {new Date().getFullYear()} Pantheon. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
