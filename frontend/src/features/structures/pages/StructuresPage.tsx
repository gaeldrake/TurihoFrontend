import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, SkeletonList } from '../../../components/ui/States';
import { ApiError } from '../../../lib/apiClient';
import { useIsAuthenticated } from '../../../lib/authStore';
import { useStructures } from '../hooks/useStructures';
import { StructureFilters } from '../components/StructureFilters';
import { StructureGrid } from '../components/StructureGrid';
import { StructureSearch } from '../components/StructureSearch';
import type { StructureListParams } from '../types/structure';
import { useDebounce } from '../../../hooks/useDebounce';

const PER_PAGE = 20;

type Filters = Pick<
  StructureListParams,
  'category' | 'city' | 'province' | 'sector' | 'status' | 'verification_status'
>;

/** Page publique /structures — recherche & filtres server-side + pagination API. */
export function StructuresPage() {
  const isAuthenticated = useIsAuthenticated();

  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput.trim(), 400);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);

  // Recherche ou filtre modifié → retour à la page 1 (pas de chargement multi-pages).
  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const params: StructureListParams = {
    ...(search ? { search } : {}),
    ...filters,
    page,
    per_page: PER_PAGE,
  };

  const { data, isPending, isError, error, refetch, isFetching } = useStructures(params);

  if (isPending) {
    return (
      <div className="space-y-6">
        <PageHeader isAuthenticated={isAuthenticated} />
        <SkeletonList count={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader isAuthenticated={isAuthenticated} />
        <ErrorState
          description={
            error instanceof ApiError && error.status >= 500
              ? 'Le service est momentanément indisponible.'
              : undefined
          }
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const { data: structures, pagination } = data;
  const isEmpty = structures.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader isAuthenticated={isAuthenticated} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <StructureSearch value={searchInput} onChange={setSearchInput} />
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 disabled:opacity-60"
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
            className={isFetching ? 'animate-spin' : ''}
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
          </svg>
          Actualiser
        </button>
      </div>

      <StructureFilters
        filters={filters}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onReset={() => setFilters({})}
      />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <p aria-live="polite" className="text-sm text-stone-500">
            {pagination.total} structure{pagination.total > 1 ? 's' : ''} trouvée
            {pagination.total > 1 ? 's' : ''} · page {pagination.page}/{Math.max(pagination.pages, 1)}
            {isFetching ? ' · mise à jour…' : ''}
          </p>

          <StructureGrid structures={structures} />

          <PaginationBar
            page={pagination.page}
            pages={pagination.pages}
            hasPrevious={pagination.has_previous}
            hasNext={pagination.has_next}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

function PageHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          Structures
        </h1>
        <p className="mt-1 max-w-xl text-sm text-stone-500">
          L’écosystème entrepreneurial du Burundi : organisations, incubateurs,
          réseaux et partenaires connectés par TURIHO.
        </p>
      </div>
      {isAuthenticated ? (
        <Link
          to="/structures/new"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700 sm:self-auto"
        >
          <span aria-hidden="true">+</span> Proposer une structure
        </Link>
      ) : null}
    </div>
  );
}

/** Pagination basée sur l'objet `pagination` renvoyé par l'API (§8 mission). */
export function PaginationBar({
  page,
  pages,
  hasPrevious,
  hasNext,
  onPageChange,
}: {
  page: number;
  pages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
}) {
  if (pages <= 1) return null;

  const btnClass =
    'rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav aria-label="Pagination des structures" className="flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        className={btnClass}
        disabled={!hasPrevious}
        onClick={() => onPageChange(page - 1)}
      >
        ← Précédent
      </button>

      <label className="flex items-center gap-2 text-sm text-stone-600">
        Page
        <input
          type="number"
          min={1}
          max={pages}
          value={page}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isInteger(n) && n >= 1 && n <= pages) onPageChange(n);
          }}
          className="w-16 rounded-lg border border-stone-300 px-2 py-1 text-center text-sm focus:border-stone-500 focus:outline-2 focus:outline-stone-400"
        />
        <span>/ {pages}</span>
      </label>

      <button
        type="button"
        className={btnClass}
        disabled={!hasNext}
        onClick={() => onPageChange(page + 1)}
      >
        Suivant →
      </button>
    </nav>
  );
}
