import { format, parseISO, isToday, isWeekend } from "date-fns";
import { hu } from "date-fns/locale";

interface Props {
  visibleDays: string[];
  cellWidth: number;
  rowHeaderWidth: number;
}

export default function TimeAxisHeader({ visibleDays, cellWidth, rowHeaderWidth }: Props) {
  return (
    <div className="flex border-b bg-muted/40 sticky top-0 z-20" style={{ minWidth: rowHeaderWidth + visibleDays.length * cellWidth }}>
      {/* Developer name header */}
      <div
        className="shrink-0 border-r flex items-end pb-1 px-3"
        style={{ width: rowHeaderWidth, minWidth: rowHeaderWidth }}
      >
        <span className="text-xs text-muted-foreground font-medium">Fejlesztő</span>
      </div>

      {/* Day columns */}
      <div className="flex">
        {visibleDays.map((day) => {
          const d = parseISO(day);
          const today = isToday(d);
          const weekend = isWeekend(d);
          return (
            <div
              key={day}
              style={{ width: cellWidth, minWidth: cellWidth }}
              className={`border-r flex flex-col items-center justify-end pb-1 pt-1 ${
                today ? "bg-primary/10" : weekend ? "bg-muted/60" : ""
              }`}
            >
              <span className={`text-[10px] ${today ? "text-primary font-bold" : "text-muted-foreground"}`}>
                {format(d, "EEE", { locale: hu })}
              </span>
              <span className={`text-xs font-medium ${today ? "text-primary font-bold" : weekend ? "text-muted-foreground" : ""}`}>
                {format(d, "d")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
