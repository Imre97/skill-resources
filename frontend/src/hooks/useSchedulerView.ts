import { addDays, addMonths, subDays, subMonths, format, parseISO, startOfWeek } from "date-fns";
import { useSchedulerStore, type ViewMode } from "../stores/schedulerStore";

const VIEW_DAYS: Record<ViewMode, number> = {
  week: 7,
  "two-week": 14,
  month: 30,
};

export function useSchedulerView() {
  const { viewMode, dateRangeStart, setViewMode, setDateRangeStart } = useSchedulerStore();

  const days = VIEW_DAYS[viewMode];
  const start = parseISO(dateRangeStart);
  const end = addDays(start, days - 1);

  const fromDate = format(start, "yyyy-MM-dd");
  const toDate = format(end, "yyyy-MM-dd");

  function goNext() {
    if (viewMode === "month") {
      setDateRangeStart(format(addMonths(start, 1), "yyyy-MM-dd"));
    } else if (viewMode === "two-week") {
      setDateRangeStart(format(addDays(start, 14), "yyyy-MM-dd"));
    } else {
      setDateRangeStart(format(addDays(start, 7), "yyyy-MM-dd"));
    }
  }

  function goPrev() {
    if (viewMode === "month") {
      setDateRangeStart(format(subMonths(start, 1), "yyyy-MM-dd"));
    } else if (viewMode === "two-week") {
      setDateRangeStart(format(subDays(start, 14), "yyyy-MM-dd"));
    } else {
      setDateRangeStart(format(subDays(start, 7), "yyyy-MM-dd"));
    }
  }

  function goToday() {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    setDateRangeStart(format(monday, "yyyy-MM-dd"));
  }

  /** All visible days as ISO strings */
  const visibleDays: string[] = Array.from({ length: days }, (_, i) =>
    format(addDays(start, i), "yyyy-MM-dd")
  );

  return {
    viewMode,
    setViewMode,
    fromDate,
    toDate,
    start,
    end,
    visibleDays,
    goNext,
    goPrev,
    goToday,
  };
}
