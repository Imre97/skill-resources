import { useState, useMemo } from "react";
import { useDeveloperProfile } from "./useDeveloperProfile";
import { useUpdateDeveloper } from "./useDevelopers";
import { useSkills } from "./useSkillMatrix";
import { type DeveloperSkillEntry } from "@/lib/api";
import { type DeveloperFormValues } from "@/schemas/developerSchema";

export function useDeveloperProfilePage(devId: number) {
  const [editOpen, setEditOpen] = useState(false);
  const [skillEditOpen, setSkillEditOpen] = useState(false);

  const { data: developer, isLoading } = useDeveloperProfile(devId);
  const { data: allSkills = [] } = useSkills();
  const { mutate: updateDev, isPending: updating } = useUpdateDeveloper(devId);

  const groupedSkills = useMemo(
    () =>
      (developer?.skills ?? []).reduce<Record<string, DeveloperSkillEntry[]>>((acc, s) => {
        (acc[s.category] ??= []).push(s);
        return acc;
      }, {}),
    [developer?.skills]
  );

  const handleUpdate = (values: DeveloperFormValues) => {
    updateDev(
      { ...values, avatar_url: values.avatar_url || undefined },
      { onSuccess: () => setEditOpen(false) }
    );
  };

  return {
    developer,
    isLoading,
    allSkills,
    editOpen,
    setEditOpen,
    skillEditOpen,
    setSkillEditOpen,
    updating,
    handleUpdate,
    groupedSkills,
  };
}
