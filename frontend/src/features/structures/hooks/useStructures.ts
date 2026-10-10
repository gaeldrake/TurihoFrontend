import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/apiContract';
import { fetchStructures } from '../api/structuresApi';
import type { StructureListParams } from '../types/structure';

/** Liste server-side (recherche + filtres + pagination) avec cache TanStack Query. */
export function useStructures(params: StructureListParams) {
  return useQuery({
    queryKey: queryKeys.structureList({ ...params }),
    queryFn: () => fetchStructures(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
