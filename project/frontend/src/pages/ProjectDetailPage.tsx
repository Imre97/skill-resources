import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Pencil, Plus, Trash2, CheckCircle2, Circle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ProjectForm from "@/components/projects/ProjectForm";
import { useProjectDetailPage } from "@/hooks/useProjectDetailPage";
import { type Task } from "@/lib/api";
import { format } from "date-fns";

const statusIcon = (status: Task["status"]) => {
  if (status === "done") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "in_progress") return <Clock className="h-4 w-4 text-yellow-500" />;
  return <Circle className="h-4 w-4 text-muted-foreground" />;
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    project, tasks,
    loadingProject, loadingTasks,
    editOpen, setEditOpen,
    taskTitle, setTaskTitle,
    deleteTaskId, setDeleteTaskId,
    updating, creatingTask, deletingTask,
    handleEditSubmit, handleAddTask,
    handleDeleteTask, handleCycleStatus,
  } = useProjectDetailPage(Number(id));

  if (loadingProject) return <LoadingSpinner />;
  if (!project) return <p className="text-sm text-destructive">{t("common.error")}</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <Badge variant="secondary">{t(`project.statuses.${project.status}`)}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="mr-1 h-3 w-3" />
          {t("common.edit")}
        </Button>
      </div>

      {project.description && (
        <p className="text-sm text-muted-foreground">{project.description}</p>
      )}

      {(project.start_date || project.end_date) && (
        <div className="flex gap-4 text-sm text-muted-foreground">
          {project.start_date && (
            <span>{t("project.startDate")}: {format(new Date(project.start_date), "yyyy.MM.dd")}</span>
          )}
          {project.end_date && (
            <span>{t("project.endDate")}: {format(new Date(project.end_date), "yyyy.MM.dd")}</span>
          )}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>{t("task.title")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder={t("task.new") + "..."}
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            />
            <Button onClick={handleAddTask} disabled={creatingTask || !taskTitle.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {loadingTasks && <LoadingSpinner />}
          {!loadingTasks && tasks.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">{t("common.empty")}</p>
          )}

          <div className="space-y-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-md border px-3 py-2 hover:bg-muted/50"
              >
                <button
                  type="button"
                  onClick={() => handleCycleStatus(task)}
                  className="shrink-0"
                  title={t(`task.statuses.${task.status}`)}
                >
                  {statusIcon(task.status)}
                </button>
                <span className={`flex-1 text-sm ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">{task.estimated_hours}h</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteTaskId(task.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("common.edit")}</DialogTitle></DialogHeader>
          <ProjectForm
            defaultValues={{
              name: project.name,
              description: project.description ?? "",
              status: project.status,
              start_date: project.start_date ?? "",
              end_date: project.end_date ?? "",
              color: project.color,
            }}
            onSubmit={handleEditSubmit}
            isPending={updating}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTaskId != null}
        title={t("common.confirm")}
        description={t("common.delete") + "?"}
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteTaskId(null)}
        isPending={deletingTask}
      />
    </div>
  );
}
