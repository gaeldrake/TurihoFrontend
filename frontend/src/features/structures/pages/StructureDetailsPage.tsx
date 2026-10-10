import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { ErrorState } from '../../../components/ui/States';
import { ApiError } from '../../../lib/apiClient';
import { useIsAdmin, useIsAuthenticated } from '../../../lib/authStore';
import { useDeleteStructure } from '../hooks/useDeleteStructure';
import { useStructure } from '../hooks/useStructure';
import { StructureDetails } from '../components/StructureDetails';

/**
 * Page profil /structures/:slug.
 * - Publique (lecture) si le backend l'autorise ;
 * - Actions modifier/supprimer visibles uniquement pour un utilisateur
 *   authentifié [permission réelle vérifiée par le backend] ;
 * - Actions admin (vérifier/suspendre) NON appelées : endpoints absents du
 *   contrat API (docs/api/structures.md §6) — voir avertissement affiché.
 */
export function StructureDetailsPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();

  const { data: structure, isPending, isError, error, refetch } = useStructure(slug);
  const deleteMutation = useDeleteStructure();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isPending) {
    return (
      <div role="status" className="py-20 text-center text-sm text-stone-500">
        Chargement…
      </div>
    );
  }

  if (isError) {
    const apiError = error instanceof ApiError ? error : null;
    if (apiError?.status === 404) {
      return (
        <div className="py-16 text-center">
          <h1 className="text-xl font-semibold text-stone-900">Structure introuvable</h1>
          <p className="mt-2 text-sm text-stone-500">
            Cette page n’existe pas ou a été supprimée.
          </p>
          <Link
            to="/structures"
            className="mt-6 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
          >
            Retour aux structures
          </Link>
        </div>
      );
    }
    if (apiError?.status === 403) {
      return (
        <ErrorState
          title="Accès refusé"
          description="Vous n’avez pas les autorisations nécessaires pour consulter cette structure."
        />
      );
    }
    return (
      <ErrorState
        title="Impossible de charger cette structure."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div>
      <StructureDetails structure={structure} />

      {/* Actions selon droits (masquage UX seulement — la sécurité est backend) */}
      {isAuthenticated ? (
        <section
          aria-label="Actions sur la structure"
          className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5"
        >
          <Link
            to={`/structures/${encodeURIComponent(String(structure.id))}/edit`}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
          >
            Modifier
          </Link>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Supprimer
          </button>
          {isAdmin ? (
            <span className="ml-auto text-xs text-stone-500">
              Vérifier / suspendre : en attente d’endpoints backend (§6 du contrat).
            </span>
          ) : null}
        </section>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Supprimer cette structure ?"
        description="Cette action peut être irréversible."
        confirmLabel="Supprimer"
        busy={deleteMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          deleteMutation.mutate(structure.id, {
            onSuccess: () => {
              setConfirmOpen(false);
              // Cache invalidé par le hook → liste actualisée automatiquement.
              navigate('/structures');
            },
          })
        }
      />

      {deleteMutation.isError ? (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-800">
          {deleteMutation.error instanceof ApiError
            ? deleteMutation.error.getUserMessage()
            : 'La suppression a échoué.'}
        </p>
      ) : null}
    </div>
  );
}
