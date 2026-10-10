import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../../lib/apiClient';
import { useCreateStructure } from '../hooks/useCreateStructure';
import { StructureForm } from '../components/StructureForm';
import type { StructureFormValues } from '../types/structure';

/** Page /structures/new — création via POST /api/v1/structures. */
export function CreateStructurePage() {
  const navigate = useNavigate();
  const mutation = useCreateStructure();
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  function handleSubmit(values: StructureFormValues) {
    setServerErrors({});
    mutation.mutate(values, {
      onSuccess: (created) => {
        // Liste invalidée par le hook ; redirection vers le profil créé.
        navigate(`/structures/${encodeURIComponent(created.slug)}`);
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
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
        Proposer une structure
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Les informations seront vérifiées par le serveur. Seuls le nom et
        éventuels champs requis par le backend sont obligatoires.
      </p>
      <div className="mt-6">
        <StructureForm
          mode="create"
          isSubmitting={mutation.isPending}
          serverErrors={serverErrors}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/structures')}
        />
      </div>
    </div>
  );
}
