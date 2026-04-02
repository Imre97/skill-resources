import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { X, GripHorizontal } from "lucide-react";
import type { Assignment, Task, Project } from "../../lib/api";

interface Props {
  assignment: Assignment;
  task: Task | undefined;
  project: Project | undefined;
  visibleDays: string[];
  cellWidth: number;
  topOffset: number;
  blockHeight: number;
  onDelete: (id: number) => void;
  onEdit?: (assignment: Assignment) => void;
  isOverloaded?: boolean;
}

export default function AssignmentBlock({
  assignment,
  task,
  project,
  visibleDays,
  cellWidth,
  topOffset,
  blockHeight,
  onDelete,
  onEdit,
  isOverloaded = false,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `assignment-${assignment.id}`,
    data: { assignment },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const firstVisible = visibleDays[0];
  const lastVisible = visibleDays[visibleDays.length - 1];

  // Clamp to visible range
  const blockStart = assignment.start_date > lastVisible ? null : assignment.start_date < firstVisible ? firstVisible : assignment.start_date;
  const blockEnd = assignment.end_date < firstVisible ? null : assignment.end_date > lastVisible ? lastVisible : assignment.end_date;

  if (!blockStart || !blockEnd) return null;

  const startIndex = visibleDays.indexOf(blockStart);
  const endIndex = visibleDays.indexOf(blockEnd);

  if (startIndex === -1 || endIndex === -1) return null;

  const spanDays = endIndex - startIndex + 1;
  const left = startIndex * cellWidth;
  const width = spanDays * cellWidth - 4;

  const projectColor = project?.color ?? "#6366f1";
  const tooltipText = [
    project?.name ?? "?",
    task?.title ?? "?",
    `${assignment.start_date} – ${assignment.end_date}`,
    `${assignment.hours_per_day}h/nap`,
    assignment.note ? `Megjegyzés: ${assignment.note}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      title={tooltipText}
      style={{
        ...style,
        left,
        top: topOffset,
        width,
        height: blockHeight,
        backgroundColor: projectColor + "33",
        borderColor: projectColor,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 10,
      }}
      className={`absolute rounded border-l-2 border flex items-center gap-1 px-1.5 cursor-pointer select-none group transition-shadow hover:shadow-md ${
        isOverloaded ? "ring-1 ring-red-500" : ""
      }`}
      onClick={() => onEdit?.(assignment)}
    >
      {/* Drag handle icon (decorative) */}
      <span className="text-muted-foreground/50 flex-shrink-0">
        <GripHorizontal className="h-3 w-3" />
      </span>

      {/* Content */}
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        <span className="text-[10px] font-semibold truncate leading-tight" style={{ color: projectColor }}>
          {project?.name ?? "?"}
        </span>
        <span className="text-[10px] text-foreground/80 truncate leading-tight">{task?.title ?? "?"}</span>
      </div>

      {/* Hours badge */}
      <span className="text-[9px] text-muted-foreground flex-shrink-0">{assignment.hours_per_day}h</span>

      {/* Delete button */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete(assignment.id); }}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-muted-foreground hover:text-destructive transition-opacity"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
