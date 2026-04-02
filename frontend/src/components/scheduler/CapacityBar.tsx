import { isWeekend, parseISO } from "date-fns";

interface Props {
  developerId: number;
  visibleDays: string[];
  cellWidth: number;
  dailyHoursMap: Record<string, Record<number, number>>;
  threshold?: number;
}

export default function CapacityBar({ developerId, visibleDays, cellWidth, dailyHoursMap, threshold = 8 }: Props) {
  return (
    <div className="flex h-4 border-b">
      {visibleDays.map((day) => {
        const hours = dailyHoursMap[day]?.[developerId] ?? 0;
        const weekend = isWeekend(parseISO(day));
        const pct = Math.min((hours / threshold) * 100, 100);
        const overloaded = hours > threshold;

        return (
          <div
            key={day}
            title={hours > 0 ? `${hours}h` : undefined}
            style={{ width: cellWidth, minWidth: cellWidth }}
            className={`border-r relative flex items-end ${weekend ? "bg-muted/40" : "bg-background"}`}
          >
            {hours > 0 && (
              <div
                className={`w-full transition-all ${overloaded ? "bg-red-400" : "bg-emerald-400/70"}`}
                style={{ height: `${pct}%` }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
