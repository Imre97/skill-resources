import { useState } from "react";
import { useProjects, useCreateProject, useDeleteProject } from "./useProjects";
import { type ProjectFormValues } from "@/schemas/projectSchema";

export function useProjectsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: projects, isLoading, isError } = useProjects();
  const { mutate: createProject, isPending: creating } = useCreateProject();
  const { mutate: deleteProject, isPending: deleting } = useDeleteProject();

  const filtered = (projects ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (values: ProjectFormValues) => {
    createProject(
      { ...values, description: values.description || undefined },
      { onSuccess: () => setCreateOpen(false) }
    );
  };

  const handleDelete = () => {
    if (deleteId == null) return;
    deleteProject(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return {
    search,
    setSearch,
    createOpen,
    setCreateOpen,
    deleteId,
    setDeleteId,
    filtered,
    isLoading,
    isError,
    creating,
    deleting,
    handleCreate,
    handleDelete,
  };
}
