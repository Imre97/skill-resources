import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { addDays, format, parseISO } from "date-fns";
import type { Developer, Assignment, Task, Project, Leave } from "../../lib/api";
import TimeAxisHeader from "./TimeAxisHeader";
import SchedulerRow from "./SchedulerRow";
import OverloadWarningDialog from "./OverloadWarningDialog";
import AssignmentForm from "./AssignmentForm";
import LeaveForm from "./LeaveForm";
import { useCapacityCalc } from "../../hooks/useCapacityCalc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface Props {
  developers: Developer[];
  assignments: Assignment[];
  leaves: Leave[];
  tasks: Task[];
  projects: Project[];
  visibleDays: string[];
  onPatchAssignment: (id: number, patch: { start_date: string; end_date: string }) => void;
  onDeleteAssignment: (id: number) => void;
  onCreateAssignment: (body: {
    developer_id: number;
    task_id: number;
    start_date: string;
    end_date: string;
    hours_per_day: number;
    note?: string;
  }) => void;
  onCreateLeave: (body: {
    developer_id: number;
    start_date: string;
    end_date: string;
    leave_type: "vacation" | "sick" | "other";
    note?: string;
  }) => void;
  isCreating?: boolean;
}

const ROW_HEADER_WIDTH = 160;
const CELL_WIDTH = 44;

export default function SchedulerTimeline({
  developers,
  assignments,
  leaves,
  tasks,
  projects,
  visibleDays,
  onPatchAssignment,
  onDeleteAssignment,
  onCreateAssignment,
  onCreateLeave,
  isCreating,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const { dailyHoursMap, wouldOverload, wouldOverloadAfterMove } = useCapacityCalc(assignments);

  type PendingDrop = { assignmentId: number; newStart: string; newEnd: string; hours: number };
  type PendingCreate = { body: Parameters<Props["onCreateAssignment"]>[0]; hours: number };

  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);
  const [pendingCreate, setPendingCreate] = useState<PendingCreate | null>(null);

  // New assignment form state
  const [assignmentForm, setAssignmentForm] = useState<{ developer: Developer; open: boolean } | null>(null);
  // Leave form state
  const [leaveForm, setLeaveForm] = useState<{ developer: Developer; open: boolean } | null>(null);
  // Detail panel state
  const [detailAssignment, setDetailAssignment] = useState<Assignment | null>(null);

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    if (!active) return;

    const id = active.id as string;
    if (!id.startsWith("assignment-")) return;

    const assignmentId = parseInt(id.replace("assignment-", ""), 10);
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    // Calculate day offset from pixel delta
    const dayOffset = Math.round(delta.x / CELL_WIDTH);
    if (dayOffset === 0) return;

    const newStart = format(addDays(parseISO(assignment.start_date), dayOffset), "yyyy-MM-dd");
    const newEnd = format(addDays(parseISO(assignment.end_date), dayOffset), "yyyy-MM-dd");

    // Overload check: get developer
    const developer = developers.find((d) => d.id === assignment.developer_id);
    if (!developer) return;

    const { overloads, maxHours } = wouldOverloadAfterMove(assignment, newStart, newEnd);

    if (overloads) {
      setPendingDrop({ assignmentId, newStart, newEnd, hours: maxHours });
    } else {
      onPatchAssignment(assignmentId, { start_date: newStart, end_date: newEnd });
    }
  }

  function confirmDrop() {
    if (!pendingDrop) return;
    onPatchAssignment(pendingDrop.assignmentId, {
      start_date: pendingDrop.newStart,
      end_date: pendingDrop.newEnd,
    });
    setPendingDrop(null);
  }

  function handleCreateAssignment(body: Parameters<Props["onCreateAssignment"]>[0]) {
    const { overloads, maxHours } = wouldOverload(
      body.developer_id,
      body.start_date,
      body.end_date,
      body.hours_per_day,
    );
    if (overloads) {
      setPendingCreate({ body, hours: maxHours });
    } else {
      onCreateAssignment(body);
    }
  }

  function confirmCreate() {
    if (!pendingCreate) return;
    onCreateAssignment(pendingCreate.body);
    setPendingCreate(null);
  }

  return (
    <>
      <div className="overflow-auto rounded-md border bg-background">
        <div style={{ minWidth: ROW_HEADER_WIDTH + visibleDays.length * CELL_WIDTH }}>
          <TimeAxisHeader
            visibleDays={visibleDays}
            cellWidth={CELL_WIDTH}
            rowHeaderWidth={ROW_HEADER_WIDTH}
          />

          <DndContext
            sensors={sensors}
            modifiers={[restrictToHorizontalAxis]}
            onDragEnd={handleDragEnd}
          >
            {developers.map((dev) => {
              const devAssignments = assignments.filter((a) => a.developer_id === dev.id);
              return (
                <SchedulerRow
                  key={dev.id}
                  developer={dev}
                  assignments={devAssignments}
                  leaves={leaves}
                  tasks={tasks}
                  projects={projects}
                  visibleDays={visibleDays}
                  cellWidth={CELL_WIDTH}
                  rowHeaderWidth={ROW_HEADER_WIDTH}
                  dailyHoursMap={dailyHoursMap}
                  onAddAssignment={(dev) => setAssignmentForm({ developer: dev, open: true })}
                  onAddLeave={(dev) => setLeaveForm({ developer: dev, open: true })}
                  onDeleteAssignment={onDeleteAssignment}
                  onEditAssignment={setDetailAssignment}
                />
              );
            })}
            <DragOverlay />
          </DndContext>
        </div>
      </div>

      {/* Overload warning – drag */}
      <OverloadWarningDialog
        open={!!pendingDrop}
        hours={pendingDrop?.hours ?? 0}
        onConfirm={confirmDrop}
        onCancel={() => setPendingDrop(null)}
      />

      {/* Overload warning – create */}
      <OverloadWarningDialog
        open={!!pendingCreate}
        hours={pendingCreate?.hours ?? 0}
        onConfirm={confirmCreate}
        onCancel={() => setPendingCreate(null)}
      />

      {/* Assignment form */}
      {assignmentForm && (
        <AssignmentForm
          open={assignmentForm.open}
          developer={assignmentForm.developer}
          tasks={tasks}
          projects={projects}
          defaultStart={visibleDays[0]}
          defaultEnd={visibleDays[6] ?? visibleDays[visibleDays.length - 1]}
          onClose={() => setAssignmentForm(null)}
          onSubmit={handleCreateAssignment}
          isLoading={isCreating}
        />
      )}

      {/* Leave form */}
      {leaveForm && (
        <LeaveForm
          open={leaveForm.open}
          developer={leaveForm.developer}
          defaultStart={visibleDays[0]}
          onClose={() => setLeaveForm(null)}
          onSubmit={onCreateLeave}
        />
      )}

      {/* Assignment detail panel */}
      {detailAssignment && (() => {
        const task = tasks.find((t) => t.id === detailAssignment.task_id);
        const project = task ? projects.find((p) => p.id === task.project_id) : undefined;
        const developer = developers.find((d) => d.id === detailAssignment.developer_id);
        return (
          <Dialog open onOpenChange={(o) => !o && setDetailAssignment(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Hozzárendelés részletei</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fejlesztő</span>
                  <span className="font-medium">{developer?.name ?? "?"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projekt</span>
                  <span className="font-medium" style={{ color: project?.color }}>
                    {project?.name ?? "?"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Feladat</span>
                  <span className="font-medium">{task?.title ?? "?"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Időszak</span>
                  <span className="font-medium">
                    {detailAssignment.start_date} – {detailAssignment.end_date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Óra/nap</span>
                  <span className="font-medium">{detailAssignment.hours_per_day}h</span>
                </div>
                {detailAssignment.note && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Megjegyzés</span>
                    <span className="font-medium text-right">{detailAssignment.note}</span>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}
    </>
  );
}
