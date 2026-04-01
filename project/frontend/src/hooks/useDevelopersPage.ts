import { useState } from "react";
import { useDevelopers, useCreateDeveloper, useDeleteDeveloper } from "./useDevelopers";
import { type DeveloperFormValues } from "@/schemas/developerSchema";

export function useDevelopersPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: developers, isLoading, isError } = useDevelopers();
  const { mutate: createDev, isPending: creating } = useCreateDeveloper();
  const { mutate: deleteDev, isPending: deleting } = useDeleteDeveloper();

  const filtered = (developers ?? []).filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.team ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (values: DeveloperFormValues) => {
    createDev(
      { ...values, avatar_url: values.avatar_url || undefined },
      { onSuccess: () => setCreateOpen(false) }
    );
  };

  const handleDelete = () => {
    if (deleteId == null) return;
    deleteDev(deleteId, { onSuccess: () => setDeleteId(null) });
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
