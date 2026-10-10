import type { ReactNode } from 'react';

/** Bandeau d'erreur accessible (rôle alert) + action Réessayer optionnelle. */
export function ErrorState({
  title = 'Impossible de charger les structures.',
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center"
    >
      <p className="font-semibold text-red-800">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-red-700">{description}</p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        >
          Réessayer
        </button>
      ) : null}
    </div>
  );
}

/** État vide sobre et lisible. */
export function EmptyState({
  title = 'Aucune structure trouvée.',
  description = 'Essayez de modifier votre recherche ou vos filtres.',
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
      <div
        aria-hidden="true"
        className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-stone-100 text-stone-500"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </div>
      <p className="font-semibold text-stone-800">{title}</p>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/** Squelette de chargement (liste de cartes). */
export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Chargement…"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="h-52 animate-pulse rounded-2xl border border-stone-200 bg-stone-100"
        />
      ))}
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
