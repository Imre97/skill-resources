import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type DeveloperCreate } from "@/lib/api";

export function useDevelopers(params?: { team?: string; skill_id?: number; min_score?: number }) {
  return useQuery({
    queryKey: ["developers", params],
    queryFn: () => api.developers.list(params),
  });
}

export function useCreateDeveloper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: DeveloperCreate) => api.developers.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["developers"] }),
  });
}

export function useUpdateDeveloper(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<DeveloperCreate>) => api.developers.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["developers"] });
      queryClient.invalidateQueries({ queryKey: ["developers", id] });
    },
  });
}

export function useDeleteDeveloper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.developers.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["developers"] }),
  });
}
