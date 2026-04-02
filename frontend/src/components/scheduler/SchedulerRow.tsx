import { useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import { Plus, Plane } from "lucide-react";
import type { Developer, Assignment, Task, Project, Leave } from "../../lib/api";
import AssignmentBlock from "./AssignmentBlock";
import CapacityBar from "./CapacityBar";
import LeaveStrip from "./LeaveStrip";

const BLOCK_HEIGHT = 40; // px (h-10)
const BLOCK_GAP = 4;     // px between lanes
const ROW_PADDING = 8;   // px top + bottom

/** Assign each assignment to a vertical lane so overlapping ones stack. */
function assignLanes(assignments: Assignment[]): Map<number, number> {
  const sorted = [...assignments].sort((a, b) => a.start_date.localeCompare(b.start_date));
  const laneMap = new Map<number, number>(); // id → lane index
  const laneEnds: string[] = [];            // last end_date per lane

  for (const a of sorted) {
    let placed = false;
    for (let i = 0; i < laneEnds.length; i++) {
      if (laneEnds[i] < a.start_date) {
        laneMap.set(a.id, i);
        laneEnds[i] = a.end_date;
        placed = true;
        break;
      }
    }
    if (!placed) {
      laneMap.set(a.id, laneEnds.length);
      laneEnds.push(a.end_date);
    }
  }

  return laneMap;
}

interface Props {
  developer: Developer;
  assignments: Assignment[];
  leaves: Leave[];
  tasks: Task[];
  projects: Project[];
  visibleDays: string[];
  cellWidth: number;
  rowHeaderWidth: number;
  dailyHoursMap: Record<string, Record<number, number>>;
  onAddAssignment: (developer: Developer) => void;
  onAddLeave: (developer: Developer) => void;
  onDeleteAssignment: (id: number) => void;
  onEditAssignment?: (assignment: Assignment) => void;
}

export default function SchedulerRow({
  developer,
  assignments,
  leaves,
  tasks,
  projects,
  visibleDays,
  cellWidth,
  rowHeaderWidth,
  dailyHoursMap,
  onAddAssignment,
  onAddLeave,
  onDeleteAssignment,
  onEditAssignment,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `row-${developer.id}`, data: { developerId: developer.id } });
  const [hovered, setHovered] = useState(false);

  const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]));
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  const laneMap = assignLanes(assignments);
  const numLanes = assignments.length === 0 ? 1 : Math.max(...laneMap.values()) + 1;
  const rowHeight = numLanes * BLOCK_HEIGHT + (numLanes - 1) * BLOCK_GAP + ROW_PADDING;

  const timelineWidth = visibleDays.length * cellWidth;

  return (
    <div
      className="flex"
      style={{ minWidth: rowHeaderWidth + timelineWidth }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Developer name column (sticky left) */}
      <div
        className="shrink-0 border-r border-b flex flex-col justify-start bg-background sticky left-0 z-10 py-1 px-2"
        style={{ width: rowHeaderWidth, minWidth: rowHeaderWidth, minHeight: rowHeight }}
      >
        <div className="flex items-center justify-between gap-1">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{developer.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{developer.position ?? developer.level}</p>
          </div>
          {hovered && (
            <div className="flex gap-0.5 flex-shrink-0">
              <button
                onClick={() => onAddAssignment(developer)}
                className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Hozzárendelés hozzáadása"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onAddLeave(developer)}
                className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-sky-600"
                title="Szabadság rögzítése"
              >
                <Plane className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline area */}
      <div className="flex flex-col flex-1">
        {/* Leave strip */}
        <LeaveStrip
          developerId={developer.id}
          visibleDays={visibleDays}
          cellWidth={cellWidth}
          leaves={leaves}
        />

        {/* Main drag area */}
        <div
          ref={setNodeRef}
          className={`relative border-b ${isOver ? "bg-primary/5" : ""}`}
          style={{ height: rowHeight, width: timelineWidth }}
        >
          {/* Background grid */}
          {visibleDays.map((day, i) => {
            const isWE = new Date(day).getDay() === 0 || new Date(day).getDay() === 6;
            return (
              <div
                key={day}
                className={`border-r h-full absolute top-0 ${isWE ? "bg-muted/30" : ""}`}
                style={{ left: i * cellWidth, width: cellWidth }}
              />
            );
          })}

          {/* Assignment blocks */}
          {assignments.map((a) => {
            const task = taskMap[a.task_id];
            const project = task ? projectMap[task.project_id] : undefined;
            const lane = laneMap.get(a.id) ?? 0;
            const topOffset = ROW_PADDING / 2 + lane * (BLOCK_HEIGHT + BLOCK_GAP);
            return (
              <AssignmentBlock
                key={a.id}
                assignment={a}
                task={task}
                project={project}
                visibleDays={visibleDays}
                cellWidth={cellWidth}
                topOffset={topOffset}
                blockHeight={BLOCK_HEIGHT}
                onDelete={onDeleteAssignment}
                onEdit={onEditAssignment}
              />
            );
          })}
        </div>

        {/* Capacity bar */}
        <CapacityBar
          developerId={developer.id}
          visibleDays={visibleDays}
          cellWidth={cellWidth}
          dailyHoursMap={dailyHoursMap}
        />
      </div>
    </div>
  );
}
