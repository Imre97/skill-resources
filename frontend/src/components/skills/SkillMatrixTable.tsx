import React from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import SkillScoreBadge from "./SkillScoreBadge";
import { useSkillStore } from "@/stores/skillStore";
import { type DeveloperWithSkills, type Skill } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SkillMatrixTableProps {
  developers: DeveloperWithSkills[];
  skills: Skill[];
  onDeveloperClick?: (dev: DeveloperWithSkills) => void;
}

export default React.memo(function SkillMatrixTable({
  developers,
  skills,
  onDeveloperClick,
}: SkillMatrixTableProps) {
  const { t } = useTranslation();
  const { selectedDeveloperIds, toggleDeveloperSelection } = useSkillStore();

  if (!developers.length || !skills.length) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[160px]">{t("developer.name")}</TableHead>
          <TableHead>{t("developer.level")}</TableHead>
          {skills.map((s) => (
            <TableHead key={s.id} className="text-center min-w-[100px]">
              <span title={s.category}>{s.name}</span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {developers.map((dev) => {
          const isSelected = selectedDeveloperIds.includes(dev.id);
          return (
            <TableRow
              key={dev.id}
              className={cn("cursor-pointer", isSelected && "bg-primary/5")}
              onClick={() => {
                toggleDeveloperSelection(dev.id);
                onDeveloperClick?.(dev);
              }}
            >
              <TableCell className="font-medium">{dev.name}</TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {t(`developer.levels.${dev.level}`)}
                </span>
              </TableCell>
              {skills.map((s) => {
                const entry = dev.skills.find((sk) => sk.skill_id === s.id);
                return (
                  <TableCell key={s.id} className="text-center">
                    {entry ? <SkillScoreBadge score={entry.score} /> : <span className="text-muted-foreground">–</span>}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
});
