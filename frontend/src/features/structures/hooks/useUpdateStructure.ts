import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/apiContract';
import { updateStructure } from '../api/structuresApi';
import type { Structure, StructureFormValues } from '../types/structure';

/** PATCH partiel /api/v1/structures/:id + invalidation liste & détail. */
export function useUpdateStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string | number;
      values: Partial<StructureFormValues>;
    }) => updateStructure(id, values),
    onSuccess: (updated: Structure) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.structures });
      queryClient.setQueryData(queryKeys.structureDetail(updated.slug), updated);
    },
  });
}
