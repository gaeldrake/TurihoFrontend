import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/apiContract';
import { createStructure } from '../api/structuresApi';
import type { StructureFormValues } from '../types/structure';

/** POST /api/v1/structures puis invalidation du cache liste. */
export function useCreateStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: StructureFormValues) => createStructure(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.structures });
    },
  });
}
