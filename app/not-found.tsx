export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-50">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Pantheon</p>
        <h1 className="mt-4 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm text-slate-300">
          The page you tried to open doesn&apos;t exist or the link has expired.
        </p>
        <a
          href="/portal"
          className="mt-6 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
        >
          Back to dashboard
        </a>
      </div>
    </div>
  )
}
