import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import DeveloperForm from "@/components/developers/DeveloperForm";
import SkillEditForm from "@/components/skills/SkillEditForm";
import SkillRadarChart from "@/components/skills/SkillRadarChart";
import SkillScoreBadge from "@/components/skills/SkillScoreBadge";
import { useDeveloperProfilePage } from "@/hooks/useDeveloperProfilePage";

export default function DeveloperProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    developer, isLoading, allSkills,
    editOpen, setEditOpen,
    skillEditOpen, setSkillEditOpen,
    updating, handleUpdate, groupedSkills,
  } = useDeveloperProfilePage(Number(id));

  if (isLoading) return <LoadingSpinner />;
  if (!developer) return <p className="text-sm text-destructive">{t("common.error")}</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{developer.name}</h1>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="mr-1 h-3 w-3" />
          {t("common.edit")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t("developer.profile")}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("developer.email")}</span>
              <span>{developer.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("developer.position")}</span>
              <span>{developer.position ?? "–"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("developer.level")}</span>
              <Badge variant="secondary">{t(`developer.levels.${developer.level}`)}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("developer.team")}</span>
              <span>{developer.team ?? "–"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Radar</CardTitle></CardHeader>
          <CardContent>
            <SkillRadarChart developers={[developer]} skills={allSkills} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("developer.skills")}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setSkillEditOpen(true)}>
            <Pencil className="mr-1 h-3 w-3" />
            {t("common.edit")}
          </Button>
        </CardHeader>
        <CardContent>
          {developer.skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("common.empty")}</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedSkills).map(([cat, skills]) => (
                <div key={cat}>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t(`skill.categories.${cat}`)}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <div key={s.skill_id} className="flex items-center gap-1.5 rounded-md border px-2 py-1">
                        <span className="text-sm">{s.name}</span>
                        <SkillScoreBadge score={s.score} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("common.edit")}</DialogTitle></DialogHeader>
          <DeveloperForm
            defaultValues={{
              name: developer.name,
              email: developer.email,
              position: developer.position ?? "",
              level: developer.level,
              team: developer.team ?? "",
            }}
            onSubmit={handleUpdate}
            isPending={updating}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={skillEditOpen} onOpenChange={setSkillEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("developer.skills")}</DialogTitle></DialogHeader>
          <SkillEditForm
            developerId={Number(id)}
            skills={allSkills}
            currentSkills={developer.skills}
            onClose={() => setSkillEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
