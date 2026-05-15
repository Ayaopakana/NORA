import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--nora-bg)] px-6 text-center text-[var(--nora-text)]">
      <p className="text-sm font-medium uppercase tracking-wide text-sky-400">
        404
      </p>
      <h1 className="text-2xl font-semibold">Страница не найдена</h1>
      <p className="max-w-md text-sm text-[var(--nora-text-muted)]">
        Маршрут не существует или был перенесён. Вернитесь на карту NORA.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-sky-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-neon hover:bg-sky-300"
      >
        На карту
      </Link>
    </div>
  )
}
