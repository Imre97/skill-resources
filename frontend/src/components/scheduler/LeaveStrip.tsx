import { parseISO, isWeekend } from "date-fns";
import type { Leave } from "../../lib/api";

interface Props {
  developerId: number;
  visibleDays: string[];
  cellWidth: number;
  leaves: Leave[];
}

const LEAVE_COLORS = {
  vacation: "bg-sky-200/80 dark:bg-sky-800/60 border-sky-300",
  sick: "bg-orange-200/80 dark:bg-orange-800/60 border-orange-300",
  other: "bg-purple-200/80 dark:bg-purple-800/60 border-purple-300",
};

export default function LeaveStrip({ developerId, visibleDays, cellWidth, leaves }: Props) {
  const devLeaves = leaves.filter((l) => l.developer_id === developerId);

  return (
    <div className="flex h-5 border-b">
      {visibleDays.map((day) => {
        const leave = devLeaves.find((l) => l.start_date <= day && l.end_date >= day);
        const weekend = isWeekend(parseISO(day));

        return (
          <div
            key={day}
            style={{ width: cellWidth, minWidth: cellWidth }}
            className={`border-r relative overflow-hidden ${
              leave
                ? LEAVE_COLORS[leave.leave_type] + " border"
                : weekend
                ? "bg-muted/40"
                : ""
            }`}
            title={leave ? `Szabadság: ${leave.leave_type}` : undefined}
          >
            {leave && day === leave.start_date && (
              <span className="text-[9px] leading-tight px-0.5 truncate block text-foreground/70">
                {leave.leave_type === "vacation" ? "Szab." : leave.leave_type === "sick" ? "Bete." : "Táv."}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
