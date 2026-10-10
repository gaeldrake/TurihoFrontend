import { Link } from 'react-router-dom';
import type { Structure } from '../types/structure';
import { StructureLogo } from './StructureLogo';
import { StructureStatusBadge, VerificationBadge } from './StructureStatus';

/** Carte sobre et professionnelle — mobile-first, aucune donnée inventée. */
export function StructureCard({ structure }: { structure: Structure }) {
  const location = [structure.city, structure.province]
    .filter((v): v is string => Boolean(v))
    .join(', ');

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start gap-4">
        <StructureLogo src={structure.logo_url} name={structure.name} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-stone-900">
            <Link
              to={`/structures/${encodeURIComponent(structure.slug)}`}
              className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
            >
              {structure.name}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-sm text-stone-500">
            {structure.category ?? 'Catégorie non renseignée'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <VerificationBadge
          verification_status={structure.verification_status}
        />
        <StructureStatusBadge status={structure.status} />
      </div>

      <dl className="mt-3 space-y-1 text-sm text-stone-600">
        {location ? (
          <div className="flex gap-2">
            <dt className="sr-only">Localisation</dt>
            <dd className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {location}
            </dd>
          </div>
        ) : null}
        {structure.sector ? (
          <div className="flex gap-2">
            <dt className="sr-only">Secteur</dt>
            <dd className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              {structure.sector}
            </dd>
          </div>
        ) : null}
      </dl>

      {structure.description ? (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-600">
          {structure.description}
        </p>
      ) : null}

      <div className="mt-auto pt-4">
        <Link
          to={`/structures/${encodeURIComponent(structure.slug)}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-stone-900 underline-offset-4 transition-colors group-hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
        >
          Voir le profil
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
