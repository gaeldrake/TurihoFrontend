import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/apiContract';
import { deleteStructure } from '../api/structuresApi';

/** DELETE /api/v1/structures/:id + invalidation complète du module. */
export function useDeleteStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteStructure(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.structures });
    },
  });
}
