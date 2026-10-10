import { api } from '../../../lib/apiClient';
import { endpoints } from '../../../lib/apiContract';
import {
  structureDetailResponseSchema,
  structureListResponseSchema,
  type Structure,
  type StructureFormValues,
  type StructureListParams,
  type StructureListResponse,
  toStructurePayload,
} from '../types/structure';

/**
 * Accès API du module Structures — consomme exclusivement /api/v1/structures
 * selon docs/api/structures.md. Les réponses sont validées par Zod (défensif)
 * afin de détecter toute divergence avec le contrat.
 */

export async function fetchStructures(
  params: StructureListParams,
): Promise<StructureListResponse> {
  const raw = await api.get<unknown>(endpoints.structures(), {
    params: { ...params },
  });
  return structureListResponseSchema.parse(raw);
}

export async function fetchStructureBySlug(slug: string): Promise<Structure> {
  const raw = await api.get<unknown>(endpoints.structureBySlug(slug));
  return structureDetailResponseSchema.parse(raw).data;
}

export async function createStructure(
  values: StructureFormValues,
): Promise<Structure> {
  // POST suppose { success, data } ; on tolère aussi un objet nu.
  const raw = await api.post<unknown>(endpoints.structures(), toStructurePayload(values));
  return unwrapStructure(raw);
}

/**
 * Mise à jour partielle : PATCH (contrat §3). N'envoie que les champs présents,
 * pour ne jamais écraser accidentellement des valeurs existantes.
 */
export async function updateStructure(
  id: string | number,
  values: Partial<StructureFormValues>,
): Promise<Structure> {
  const raw = await api.patch<unknown>(
    endpoints.structureById(id),
    toStructurePayload(values as StructureFormValues),
  );
  return unwrapStructure(raw);
}

export async function deleteStructure(id: string | number): Promise<void> {
  await api.delete<unknown>(endpoints.structureById(id));
}

function unwrapStructure(raw: unknown): Structure {
  const candidate = raw as { data?: unknown };
  const body = candidate && 'data' in candidate ? candidate.data : raw;
  return structureDetailResponseSchema.shape.data.parse(body);
}
