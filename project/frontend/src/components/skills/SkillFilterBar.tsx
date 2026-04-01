import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSkillStore, type SkillCategory } from "@/stores/skillStore";

const CATEGORIES: { value: SkillCategory; labelKey: string }[] = [
  { value: "", labelKey: "common.filter" },
  { value: "frontend", labelKey: "skill.categories.frontend" },
  { value: "backend", labelKey: "skill.categories.backend" },
  { value: "devops", labelKey: "skill.categories.devops" },
  { value: "soft", labelKey: "skill.categories.soft" },
  { value: "other", labelKey: "skill.categories.other" },
];

export default function SkillFilterBar() {
  const { t } = useTranslation();
  const { filters, setFilters, resetFilters } = useSkillStore();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder={t("common.search")}
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        className="w-48"
      />
      <select
        className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={filters.category}
        onChange={(e) => setFilters({ category: e.target.value as SkillCategory })}
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {t(c.labelKey)}
          </option>
        ))}
      </select>
      <select
        className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={filters.minScore}
        onChange={(e) => setFilters({ minScore: Number(e.target.value) })}
      >
        <option value={0}>{t("skill.score")}: {t("common.filter")}</option>
        {[1, 2, 3, 4, 5].map((s) => (
          <option key={s} value={s}>
            ≥ {s} – {t(`skill.scoreLabels.${s}`)}
          </option>
        ))}
      </select>
      <Button variant="outline" size="sm" onClick={resetFilters}>
        {t("common.reset")}
      </Button>
    </div>
  );
}
