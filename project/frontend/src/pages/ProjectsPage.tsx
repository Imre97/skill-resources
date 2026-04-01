import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectForm from "@/components/projects/ProjectForm";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { useProjectsPage } from "@/hooks/useProjectsPage";

export default function ProjectsPage() {
  const { t } = useTranslation();
  const {
    search, setSearch,
    createOpen, setCreateOpen,
    deleteId, setDeleteId,
    filtered, isLoading, isError,
    creating, deleting,
    handleCreate, handleDelete,
  } = useProjectsPage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t("project.title")}</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          {t("project.new")}
        </Button>
      </div>

      <Input
        placeholder={t("common.search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {isLoading && <LoadingSpinner />}
      {isError && <p className="text-sm text-destructive">{t("common.error")}</p>}
      {!isLoading && !isError && filtered.length === 0 && <EmptyState />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} onDelete={setDeleteId} />
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("project.new")}</DialogTitle>
          </DialogHeader>
          <ProjectForm
            onSubmit={handleCreate}
            isPending={creating}
            onCancel={() => setCreateOpen(false)}
            submitLabel={t("common.create")}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId != null}
        title={t("common.confirm")}
        description={t("common.delete") + "?"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isPending={deleting}
      />
    </div>
  );
}
