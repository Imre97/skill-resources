import { useState, useMemo } from "react";
import { useUpsertSkills } from "./useDeveloperProfile";
import { type Skill, type DeveloperSkillEntry } from "@/lib/api";

export function useSkillEditForm(
  developerId: number,
  skills: Skill[],
  currentSkills: DeveloperSkillEntry[],
  onClose?: () => void
) {
  const { mutate, isPending } = useUpsertSkills(developerId);

  const [scores, setScores] = useState<Record<number, number>>(() =>
    Object.fromEntries(currentSkills.map((s) => [s.skill_id, s.score]))
  );

  const grouped = useMemo(
    () =>
      skills.reduce<Record<string, Skill[]>>((acc, s) => {
        (acc[s.category] ??= []).push(s);
        return acc;
      }, {}),
    [skills]
  );

  const setScore = (skillId: number, value: number) => {
    setScores((prev) => ({ ...prev, [skillId]: value }));
  };

  const handleSave = () => {
    const payload = Object.entries(scores)
      .filter(([, score]) => score > 0)
      .map(([skill_id, score]) => ({ skill_id: Number(skill_id), score }));
    mutate(payload, { onSuccess: onClose });
  };

  return { scores, setScore, grouped, isPending, handleSave };
}
