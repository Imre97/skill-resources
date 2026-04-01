import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SkillFilterBar from "@/components/skills/SkillFilterBar";
import SkillMatrixTable from "@/components/skills/SkillMatrixTable";
import SkillRadarChart from "@/components/skills/SkillRadarChart";
import SkillForm from "@/components/skills/SkillForm";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { useSkillMatrixPage } from "@/hooks/useSkillMatrixPage";

export default function SkillMatrixPage() {
  const { t } = useTranslation();
  const {
    createOpen, setCreateOpen,
    deleteSkillId, setDeleteSkillId,
    developers, skills, allSkills,
    selectedDevelopers,
    isLoading, isError,
    creating, deleting,
    handleCreate, handleDelete,
  } = useSkillMatrixPage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t("skill.title")}</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          {t("skill.new")}
        </Button>
      </div>

      <SkillFilterBar />

      {isLoading && <LoadingSpinner />}
      {isError && <p className="text-sm text-destructive">{t("common.error")}</p>}

      {!isLoading && !isError && (
        <>
          {developers.length === 0 ? (
            <EmptyState />
          ) : (
            <Card>
              <CardContent className="pt-4 overflow-x-auto">
                <SkillMatrixTable developers={developers} skills={skills} />
              </CardContent>
            </Card>
          )}

          {selectedDevelopers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDevelopers.length === 1
                    ? selectedDevelopers[0].name
                    : `${selectedDevelopers.length} fejlesztő összehasonlítva`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SkillRadarChart developers={selectedDevelopers} skills={skills} />
              </CardContent>
            </Card>
          )}

          {allSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("skill.title")} – összes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-1.5 rounded-full border pl-3 pr-1 py-1">
                      <Badge variant="outline" className="border-0 p-0 text-xs font-normal">
                        {t(`skill.categories.${skill.category}`)}
                      </Badge>
                      <span className="text-sm font-medium">{skill.name}</span>
                      <button
                        type="button"
                        onClick={() => setDeleteSkillId(skill.id)}
                        className="ml-1 rounded-full p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("skill.new")}</DialogTitle>
          </DialogHeader>
          <SkillForm
            onSubmit={handleCreate}
            isPending={creating}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteSkillId != null}
        title={t("common.confirm")}
        description={t("common.delete") + "?"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteSkillId(null)}
        isPending={deleting}
      />
    </div>
  );
}
