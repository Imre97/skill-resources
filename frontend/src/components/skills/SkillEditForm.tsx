import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import SkillScoreBadge from "./SkillScoreBadge";
import { useSkillEditForm } from "@/hooks/useSkillEditForm";
import { type Skill, type DeveloperSkillEntry } from "@/lib/api";

interface SkillEditFormProps {
  developerId: number;
  skills: Skill[];
  currentSkills: DeveloperSkillEntry[];
  onClose?: () => void;
}

export default function SkillEditForm({ developerId, skills, currentSkills, onClose }: SkillEditFormProps) {
  const { t } = useTranslation();
  const { scores, setScore, grouped, isPending, handleSave } = useSkillEditForm(
    developerId,
    skills,
    currentSkills,
    onClose
  );

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([cat, catSkills]) => (
        <div key={cat}>
          <h4 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t(`skill.categories.${cat}`)}
          </h4>
          <div className="space-y-2">
            {catSkills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between gap-4">
                <span className="text-sm flex-1">{skill.name}</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setScore(skill.id, val)}
                      className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                        scores[skill.id] === val && val > 0
                          ? "ring-2 ring-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      {val === 0 ? <span className="text-muted-foreground">–</span> : <SkillScoreBadge score={val} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        {onClose && (
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {t("common.cancel")}
          </Button>
        )}
        <Button onClick={handleSave} disabled={isPending}>
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
}
