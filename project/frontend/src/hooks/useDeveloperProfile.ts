import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDeveloperProfile(id: number) {
  return useQuery({
    queryKey: ["developers", id],
    queryFn: () => api.developers.get(id),
    enabled: !!id,
  });
}

export function useUpsertSkills(developerId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skills: { skill_id: number; score: number }[]) =>
      api.developers.upsertSkills(developerId, skills),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["developers", developerId] });
      queryClient.invalidateQueries({ queryKey: ["skill-matrix"] });
    },
  });
}
