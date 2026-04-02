import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api, type AssignmentCreate, type AssignmentUpdate, type LeaveCreate } from "../lib/api";
import { useSchedulerStore } from "../stores/schedulerStore";
import { useSchedulerView } from "./useSchedulerView";

export function useScheduler() {
  const { fromDate, toDate } = useSchedulerView();
  const { setAssignments, setLeaves, addAssignment, updateAssignment, deleteAssignment, addLeave, deleteLeave } =
    useSchedulerStore();
  const qc = useQueryClient();

  const assignmentsQuery = useQuery({
    queryKey: ["assignments", fromDate, toDate],
    queryFn: () => api.assignments.list({ from_date: fromDate, to_date: toDate }),
    staleTime: 30_000,
  });

  const leavesQuery = useQuery({
    queryKey: ["leaves", fromDate, toDate],
    queryFn: () => api.leaves.list({ from_date: fromDate, to_date: toDate }),
    staleTime: 60_000,
  });

  const developersQuery = useQuery({
    queryKey: ["developers"],
    queryFn: () => api.developers.list(),
    staleTime: 60_000,
  });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
    staleTime: 60_000,
  });

  const activeProjectIds = (projectsQuery.data ?? [])
    .filter((p) => p.status === "active")
    .map((p) => p.id);

  const tasksPerProject = useQuery({
    queryKey: ["all-tasks-for-scheduler", activeProjectIds],
    queryFn: () =>
      Promise.all(activeProjectIds.map((id) => api.projects.listTasks(id))).then((r) => r.flat()),
    enabled: activeProjectIds.length > 0,
    staleTime: 0,
  });

  useEffect(() => {
    if (assignmentsQuery.data) setAssignments(assignmentsQuery.data);
  }, [assignmentsQuery.data, setAssignments]);

  useEffect(() => {
    if (leavesQuery.data) setLeaves(leavesQuery.data);
  }, [leavesQuery.data, setLeaves]);

  const createAssignment = useMutation({
    mutationFn: (body: AssignmentCreate) => api.assignments.create(body),
    onSuccess: (data) => {
      addAssignment(data);
      qc.invalidateQueries({ queryKey: ["assignments"] });
    },
  });

  const patchAssignment = useMutation({
    mutationFn: ({ id, body }: { id: number; body: AssignmentUpdate }) =>
      api.assignments.update(id, body),
    onSuccess: (data) => {
      updateAssignment(data.id, data);
      qc.invalidateQueries({ queryKey: ["assignments"] });
    },
  });

  const removeAssignment = useMutation({
    mutationFn: (id: number) => api.assignments.delete(id),
    onSuccess: (_, id) => {
      deleteAssignment(id);
      qc.invalidateQueries({ queryKey: ["assignments"] });
    },
  });

  const createLeave = useMutation({
    mutationFn: (body: LeaveCreate) => api.leaves.create(body),
    onSuccess: (data) => {
      addLeave(data);
      qc.invalidateQueries({ queryKey: ["leaves"] });
    },
  });

  const removeLeave = useMutation({
    mutationFn: (id: number) => api.leaves.delete(id),
    onSuccess: (_, id) => {
      deleteLeave(id);
      qc.invalidateQueries({ queryKey: ["leaves"] });
    },
  });

  return {
    assignments: useSchedulerStore((s) => s.assignments),
    leaves: useSchedulerStore((s) => s.leaves),
    developers: developersQuery.data ?? [],
    projects: projectsQuery.data ?? [],
    tasks: tasksPerProject.data ?? [],
    isLoading: assignmentsQuery.isLoading || leavesQuery.isLoading || developersQuery.isLoading,
    isError: assignmentsQuery.isError || leavesQuery.isError,
    createAssignment,
    patchAssignment,
    removeAssignment,
    createLeave,
    removeLeave,
  };
}
