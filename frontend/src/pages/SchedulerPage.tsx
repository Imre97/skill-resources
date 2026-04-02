import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import SchedulerToolbar from "../components/scheduler/SchedulerToolbar";
import SchedulerTimeline from "../components/scheduler/SchedulerTimeline";
import { useScheduler } from "../hooks/useScheduler";
import { useSchedulerView } from "../hooks/useSchedulerView";

export default function SchedulerPage() {
  const { t } = useTranslation();
  const view = useSchedulerView();
  const {
    assignments,
    leaves,
    developers,
    projects,
    tasks,
    isLoading,
    isError,
    createAssignment,
    patchAssignment,
    removeAssignment,
    createLeave,
  } = useScheduler();

  const dateLabel = `${format(view.start, "yyyy. MMM d.", { locale: hu })} – ${format(view.end, "MMM d.", { locale: hu })}`;

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <EmptyState message={t("common.error")} />;

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold">{t("scheduler.title")}</h2>

      <SchedulerToolbar
        viewMode={view.viewMode}
        onViewChange={view.setViewMode}
        onPrev={view.goPrev}
        onNext={view.goNext}
        onToday={view.goToday}
        dateLabel={dateLabel}
      />

      {developers.length === 0 ? (
        <EmptyState message="Nincs még fejlesztő. Adj hozzá fejlesztőket a Fejlesztők oldalon." />
      ) : (
        <SchedulerTimeline
          developers={developers}
          assignments={assignments}
          leaves={leaves}
          tasks={tasks}
          projects={projects}
          visibleDays={view.visibleDays}
          onPatchAssignment={(id, patch) => patchAssignment.mutate({ id, body: patch })}
          onDeleteAssignment={(id) => removeAssignment.mutate(id)}
          onCreateAssignment={(body) => createAssignment.mutate(body)}
          onCreateLeave={(body) => createLeave.mutate(body)}
          isCreating={createAssignment.isPending}
        />
      )}
    </div>
  );
}
