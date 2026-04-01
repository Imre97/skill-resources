import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface SkillScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

const scoreColors: Record<number, string> = {
  1: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  2: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  3: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  4: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  5: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function SkillScoreBadge({ score, showLabel = false, className }: SkillScoreBadgeProps) {
  const { t } = useTranslation();
  const color = scoreColors[score] ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", color, className)}
      title={showLabel ? undefined : t(`skill.scoreLabels.${score}`)}
    >
      {score}
      {showLabel && <span className="hidden sm:inline">– {t(`skill.scoreLabels.${score}`)}</span>}
    </span>
  );
}
