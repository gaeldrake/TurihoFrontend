import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/ui/States';
import { ApiError } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/apiContract';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateStructure } from '../hooks/useUpdateStructure';
import { StructureForm } from '../components/StructureForm';
import type { Structure, StructureFormValues } from '../types/structure';

/**
 * Page /structures/:id/edit.
 * Le slug de l'identifiant est stocké dans le cache de la liste (clé
 * `['structures','list',{}]`) pour résoudre id → slug et charger les données
 * existantes AVANT d'afficher le formulaire — sans endpoint non documenté.
 */
export function EditStructurePage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useUpdateStructure();
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  // Résolution id → slug depuis le cache des listes déjà fetchées.
  const cachedSlug = findSlugInCache(queryClient, id);
  const cachedDetail = cachedSlug
    ? queryClient.getQueryData<Structure>(queryKeys.structureDetail(cachedSlug))
    : undefined;
  const cachedStructure =
    cachedDetail ?? findStructureInCache(queryClient, id);

  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    // Si la donnée n'est pas en cache, on tente un rafraîchissement de la liste.
    if (!cachedStructure) {
      void queryClient.refetchQueries({ queryKey: ['structures', 'list'] });
    }
  }, [cachedStructure, queryClient]);

  if (!cachedStructure) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          title="Impossible de charger cette structure."
          description="Ouvrez d’abord son profil puis cliquez sur « Modifier », ou réessayez."
          onRetry={() => setFormKey((k) => k + 1)}
        />
      </div>
    );
  }

  const initialValues: Partial<StructureFormValues> = {
    name: cachedStructure.name,
    category: cachedStructure.category ?? '',
    sector: cachedStructure.sector ?? '',
    description: cachedStructure.description ?? '',
    email: cachedStructure.email ?? '',
    phone: cachedStructure.phone ?? '',
    website: cachedStructure.website ?? '',
    address: cachedStructure.address ?? '',
    city: cachedStructure.city ?? '',
    province: cachedStructure.province ?? '',
    country: cachedStructure.country ?? '',
    founded_year: cachedStructure.founded_year ?? '',
    logo_url: cachedStructure.logo_url ?? '',
    cover_url: cachedStructure.cover_url ?? '',
  };

  function handleSubmit(values: StructureFormValues) {
    setServerErrors({});
    mutation.mutate(
      { id: cachedStructure!.id, values },
      {
        onSuccess: (updated) => {
          navigate(`/structures/${encodeURIComponent(updated.slug)}`);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            const fieldErrors = err.getFieldErrors();
            setServerErrors(
              Object.keys(fieldErrors).length
                ? fieldErrors
                : { form: [err.getUserMessage()] },
            );
          } else {
            setServerErrors({ form: ['Une erreur inattendue est survenue.'] });
          }
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-3xl" key={formKey}>
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
        Modifier « {cachedStructure.name} »
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Les champs laissés vides ne seront pas envoyés (PATCH partiel) : vos
        informations existantes ne sont jamais écrasées accidentellement.
      </p>
      <div className="mt-6">
        <StructureForm
          mode="edit"
          initialValues={initialValues}
          isSubmitting={mutation.isPending}
          serverErrors={serverErrors}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}

/* Helpers de résolution depuis le cache TanStack Query. */

function allListStructures(queryClient: ReturnType<typeof useQueryClient>): Structure[] {
  const state = queryClient.getQueryCache();
  const out: Structure[] = [];
  for (const query of state.getAll()) {
    const key = query.queryKey;
    if (key[0] === 'structures' && key[1] === 'list') {
      const data = query.state.data as { data?: Structure[] } | undefined;
      if (data?.data) out.push(...data.data);
    }
  }
  return out;
}

function findSlugInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
): string | undefined {
  return allListStructures(queryClient).find((s) => String(s.id) === id)?.slug;
}

function findStructureInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
): Structure | undefined {
  return allListStructures(queryClient).find((s) => String(s.id) === id);
}
