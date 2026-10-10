import { Link } from 'react-router-dom';
import type { Structure } from '../types/structure';
import { StructureLogo } from './StructureLogo';
import { StructureStatusBadge, VerificationBadge } from './StructureStatus';

/** En-tête + informations du profil structure (page /structures/:slug). */
export function StructureDetails({ structure }: { structure: Structure }) {
  const infoRows: Array<{ label: string; value?: string | number | null; href?: string }> = [
    { label: 'Secteur', value: structure.sector },
    { label: 'Année de création', value: structure.founded_year },
    { label: 'Adresse', value: structure.address },
    { label: 'Ville', value: structure.city },
    { label: 'Province', value: structure.province },
    { label: 'Pays', value: structure.country },
    {
      label: 'Téléphone',
      value: structure.phone,
      href: structure.phone ? `tel:${structure.phone}` : undefined,
    },
    {
      label: 'E-mail',
      value: structure.email,
      href: structure.email ? `mailto:${structure.email}` : undefined,
    },
    {
      label: 'Site web',
      value: structure.website,
      href: structure.website ?? undefined,
    },
  ];

  const visibleRows = infoRows.filter((r) => r.value !== undefined && r.value !== null && r.value !== '');

  return (
    <div>
      {/* Header : cover + logo + nom + badges */}
      <header className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="h-36 w-full bg-stone-100 sm:h-48">
          {structure.cover_url ? (
            <img
              src={structure.cover_url}
              alt={`Bannière de ${structure.name}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="px-5 pb-5 sm:px-8">
          <div className="-mt-8 flex flex-col gap-4 sm:-mt-10 sm:flex-row sm:items-end">
            <StructureLogo src={structure.logo_url} name={structure.name} size="lg" />
            <div className="min-w-0 flex-1 pb-1">
              <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                {structure.name}
              </h1>
              <p className="mt-0.5 text-sm text-stone-500">
                {structure.category ?? 'Catégorie non renseignée'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pb-1">
              <VerificationBadge verification_status={structure.verification_status} />
              <StructureStatusBadge status={structure.status} />
            </div>
          </div>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section
          aria-labelledby="description-heading"
          className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 lg:col-span-2"
        >
          <h2 id="description-heading" className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Description
          </h2>
          {structure.description ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-700">
              {structure.description}
            </p>
          ) : (
            <p className="mt-3 text-sm italic text-stone-400">
              Cette structure n’a pas encore de description.
            </p>
          )}
        </section>

        <section
          aria-labelledby="info-heading"
          className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"
        >
          <h2 id="info-heading" className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Informations
          </h2>
          {visibleRows.length ? (
            <dl className="mt-3 space-y-3 text-sm">
              {visibleRows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <dt className="shrink-0 text-stone-500">{row.label}</dt>
                  <dd className="min-w-0 break-words text-right font-medium text-stone-800">
                    {row.href ? (
                      row.label === 'Site web' ? (
                        <a
                          href={row.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
                        >
                          {String(row.value)}
                        </a>
                      ) : (
                        <a
                          href={row.href}
                          className="underline underline-offset-2 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
                        >
                          {String(row.value)}
                        </a>
                      )
                    ) : (
                      String(row.value)
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-sm italic text-stone-400">Aucune information de contact.</p>
          )}
          <Link
            to="/structures"
            className="mt-6 inline-block text-sm font-medium text-stone-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
          >
            ← Retour à la liste
          </Link>
        </section>
      </div>
    </div>
  );
}
