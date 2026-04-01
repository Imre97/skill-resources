import { useState } from "react";
import { useSkillMatrix, useCreateSkill, useDeleteSkill } from "./useSkillMatrix";
import { useSkillStore } from "@/stores/skillStore";
import { type DeveloperWithSkills } from "@/lib/api";
import { type SkillFormValues } from "@/schemas/skillSchema";

export function useSkillMatrixPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteSkillId, setDeleteSkillId] = useState<number | null>(null);

  const { developers, allDevelopers, skills, allSkills, isLoading, isError } = useSkillMatrix();
  const { selectedDeveloperIds } = useSkillStore();
  const { mutate: createSkill, isPending: creating } = useCreateSkill();
  const { mutate: deleteSkill, isPending: deleting } = useDeleteSkill();

  const selectedDevelopers = allDevelopers.filter((d): d is DeveloperWithSkills =>
    selectedDeveloperIds.includes(d.id)
  );

  const handleCreate = (values: SkillFormValues) => {
    createSkill(
      { ...values, description: values.description || undefined },
      { onSuccess: () => setCreateOpen(false) }
    );
  };

  const handleDelete = () => {
    if (deleteSkillId == null) return;
    deleteSkill(deleteSkillId, { onSuccess: () => setDeleteSkillId(null) });
  };

  return {
    createOpen,
    setCreateOpen,
    deleteSkillId,
    setDeleteSkillId,
    developers,
    skills,
    allSkills,
    selectedDevelopers,
    isLoading,
    isError,
    creating,
    deleting,
    handleCreate,
    handleDelete,
  };
}
