import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type TaskCreate, type SkillRequirementCreate } from "@/lib/api";

export function useProjectDetail(id: number) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => api.projects.get(id),
    enabled: !!id,
  });
}

export function useProjectTasks(projectId: number) {
  return useQuery({
    queryKey: ["projects", projectId, "tasks"],
    queryFn: () => api.projects.listTasks(projectId),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TaskCreate) => api.projects.createTask(projectId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] }),
  });
}

export function useUpdateTask(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<TaskCreate> }) =>
      api.tasks.update(id, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] }),
  });
}

export function useDeleteTask(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.tasks.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] }),
  });
}

export function useProjectRequirements(projectId: number) {
  return useQuery({
    queryKey: ["projects", projectId, "requirements"],
    queryFn: () => api.projects.getRequirements(projectId),
    enabled: !!projectId,
  });
}

export function useUpsertRequirements(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SkillRequirementCreate[]) =>
      api.projects.upsertRequirements(projectId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "requirements"] }),
  });
}
