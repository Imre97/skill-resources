import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import type { ViewMode } from "../../stores/schedulerStore";

interface Props {
  viewMode: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  dateLabel: string;
}

const VIEWS: { key: ViewMode; labelKey: string }[] = [
  { key: "week", labelKey: "scheduler.week" },
  { key: "two-week", labelKey: "scheduler.twoWeek" },
  { key: "month", labelKey: "scheduler.month" },
];

export default function SchedulerToolbar({ viewMode, onViewChange, onPrev, onNext, onToday, dateLabel }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onToday} className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          Ma
        </Button>
        <Button variant="outline" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium ml-2 text-muted-foreground">{dateLabel}</span>
      </div>

      <div className="flex gap-1 rounded-md border p-0.5 bg-muted">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => onViewChange(v.key)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              viewMode === v.key
                ? "bg-background text-foreground shadow-sm font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(v.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
