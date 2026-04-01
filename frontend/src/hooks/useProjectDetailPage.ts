import { useState } from "react";
import {
  useProjectDetail,
  useProjectTasks,
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
} from "./useProjectDetail";
import { useUpdateProject } from "./useProjects";
import { type Task } from "@/lib/api";
import { type ProjectFormValues } from "@/schemas/projectSchema";

const TASK_STATUSES: Task["status"][] = ["open", "in_progress", "done"];

export function useProjectDetailPage(projectId: number) {
  const [editOpen, setEditOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);

  const { data: project, isLoading: loadingProject } = useProjectDetail(projectId);
  const { data: tasks = [], isLoading: loadingTasks } = useProjectTasks(projectId);
  const { mutate: updateProject, isPending: updating } = useUpdateProject(projectId);
  const { mutate: createTask, isPending: creatingTask } = useCreateTask(projectId);
  const { mutate: deleteTask, isPending: deletingTask } = useDeleteTask(projectId);
  const { mutate: updateTask } = useUpdateTask(projectId);

  const handleEditSubmit = (values: ProjectFormValues) => {
    updateProject(
      { ...values, description: values.description || undefined },
      { onSuccess: () => setEditOpen(false) }
    );
  };

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;
    createTask({ title: taskTitle.trim() }, { onSuccess: () => setTaskTitle("") });
  };

  const handleDeleteTask = () => {
    if (deleteTaskId == null) return;
    deleteTask(deleteTaskId, { onSuccess: () => setDeleteTaskId(null) });
  };

  const handleCycleStatus = (task: Task) => {
    const next = TASK_STATUSES[(TASK_STATUSES.indexOf(task.status) + 1) % TASK_STATUSES.length];
    updateTask({ id: task.id, body: { status: next } });
  };

  return {
    project,
    tasks,
    loadingProject,
    loadingTasks,
    editOpen,
    setEditOpen,
    taskTitle,
    setTaskTitle,
    deleteTaskId,
    setDeleteTaskId,
    updating,
    creatingTask,
    deletingTask,
    handleEditSubmit,
    handleAddTask,
    handleDeleteTask,
    handleCycleStatus,
  };
}
