import { Link } from 'react-router-dom';

/** Coquille visuelle sobre reprenant l'identité TURIHO des maquettes HTML. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 text-stone-900 antialiased">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-baseline gap-2 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
          >
            <span className="text-lg font-bold tracking-tight text-stone-900">TURIHO</span>
            <span className="hidden text-xs text-stone-500 sm:inline">
              Connecter • Collaborer • Croître
            </span>
          </Link>
          <nav aria-label="Navigation principale" className="flex items-center gap-1 text-sm">
            <Link
              to="/structures"
              className="rounded-lg px-3 py-2 font-medium text-stone-700 transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
            >
              Structures
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-stone-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} TURIHO — Plateforme entrepreneuriale du Burundi</p>
          <p>Connecter • Collaborer • Croître</p>
        </div>
      </footer>
    </div>
  );
}
