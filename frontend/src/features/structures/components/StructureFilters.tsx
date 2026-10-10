import {
  structureStatusValues,
  verificationStatusValues,
  type StructureListParams,
} from '../types/structure';
import { statusLabels, verificationLabels } from './StructureStatus';

/**
 * Filtres — uniquement les paramètres présents dans docs/api/structures.md §4 :
 * category, city, province, sector, status, verification_status.
 * ⚠️ Les valeurs des enums et la liste des provinces sont [À CONFIRMER backend] ;
 * en l'absence d'endpoint de taxonomie, ce sont des champs texte libre / selects
 * bornés par les enums supposés du contrat.
 */
export function StructureFilters({
  filters,
  onChange,
  onReset,
}: {
  /** Valeurs courantes des filtres API (hors search/page). */
  filters: Pick<
    StructureListParams,
    'category' | 'city' | 'province' | 'sector' | 'status' | 'verification_status'
  >;
  onChange: (patch: Partial<typeof filters>) => void;
  onReset: () => void;
}) {
  const hasActive = Object.values(filters).some((v) => v !== undefined && v !== '');

  const fieldClass =
    'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-2 focus:outline-stone-400';

  return (
    <section
      aria-label="Filtres des structures"
      className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div>
          <label htmlFor="filter-category" className="mb-1 block text-xs font-medium text-stone-600">
            Catégorie
          </label>
          <input
            id="filter-category"
            type="text"
            value={filters.category ?? ''}
            onChange={(e) => onChange({ category: e.target.value || undefined })}
            placeholder="Toutes"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="filter-city" className="mb-1 block text-xs font-medium text-stone-600">
            Ville
          </label>
          <input
            id="filter-city"
            type="text"
            value={filters.city ?? ''}
            onChange={(e) => onChange({ city: e.target.value || undefined })}
            placeholder="Toutes"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="filter-province" className="mb-1 block text-xs font-medium text-stone-600">
            Province
          </label>
          <input
            id="filter-province"
            type="text"
            value={filters.province ?? ''}
            onChange={(e) => onChange({ province: e.target.value || undefined })}
            placeholder="Toutes"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="filter-sector" className="mb-1 block text-xs font-medium text-stone-600">
            Secteur
          </label>
          <input
            id="filter-sector"
            type="text"
            value={filters.sector ?? ''}
            onChange={(e) => onChange({ sector: e.target.value || undefined })}
            placeholder="Tous"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="filter-status" className="mb-1 block text-xs font-medium text-stone-600">
            Statut
          </label>
          <select
            id="filter-status"
            value={filters.status ?? ''}
            onChange={(e) =>
              onChange({
                status: (e.target.value || undefined) as typeof filters.status,
              })
            }
            className={fieldClass}
          >
            <option value="">Tous</option>
            {structureStatusValues.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="filter-verification"
            className="mb-1 block text-xs font-medium text-stone-600"
          >
            Vérification
          </label>
          <select
            id="filter-verification"
            value={filters.verification_status ?? ''}
            onChange={(e) =>
              onChange({
                verification_status: (e.target.value ||
                  undefined) as typeof filters.verification_status,
              })
            }
            className={fieldClass}
          >
            <option value="">Toutes</option>
            {verificationStatusValues.map((v) => (
              <option key={v} value={v}>
                {verificationLabels[v]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActive ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-3 text-sm font-medium text-stone-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
        >
          Réinitialiser les filtres
        </button>
      ) : null}
    </section>
  );
}

