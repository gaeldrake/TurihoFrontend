import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/apiContract';
import { fetchStructureBySlug } from '../api/structuresApi';

/** Détail d'une structure par slug (page profil). */
export function useStructure(slug: string) {
  return useQuery({
    queryKey: queryKeys.structureDetail(slug),
    queryFn: () => fetchStructureBySlug(slug),
    enabled: slug.length > 0,
    staleTime: 30_000,
  });
}
