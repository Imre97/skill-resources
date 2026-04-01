import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DeveloperCard from "@/components/developers/DeveloperCard";
import DeveloperForm from "@/components/developers/DeveloperForm";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { useDevelopersPage } from "@/hooks/useDevelopersPage";

export default function DevelopersPage() {
  const { t } = useTranslation();
  const {
    search, setSearch,
    createOpen, setCreateOpen,
    deleteId, setDeleteId,
    filtered, isLoading, isError,
    creating, deleting,
    handleCreate, handleDelete,
  } = useDevelopersPage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t("developer.title")}</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          {t("developer.new")}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((dev) => (
          <DeveloperCard key={dev.id} developer={dev} onDelete={setDeleteId} />
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("developer.new")}</DialogTitle>
          </DialogHeader>
          <DeveloperForm
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
