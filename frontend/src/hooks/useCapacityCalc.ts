import { useMemo } from "react";
import { eachDayOfInterval, parseISO, format } from "date-fns";
import type { Assignment, Leave } from "../lib/api";

/** Returns a map of { "yyyy-MM-dd": { developerId: totalHours } } */
export function useCapacityCalc(assignments: Assignment[]) {
  const dailyHoursMap = useMemo(() => {
    const map: Record<string, Record<number, number>> = {};
    for (const a of assignments) {
      const days = eachDayOfInterval({
        start: parseISO(a.start_date),
        end: parseISO(a.end_date),
      });
      for (const day of days) {
        const key = format(day, "yyyy-MM-dd");
        if (!map[key]) map[key] = {};
        map[key][a.developer_id] = (map[key][a.developer_id] ?? 0) + a.hours_per_day;
      }
    }
    return map;
  }, [assignments]);

  function getHoursForDay(developerId: number, date: string): number {
    return dailyHoursMap[date]?.[developerId] ?? 0;
  }

  function getDeveloperHoursInRange(developerId: number, start: string, end: string): number {
    const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });
    return days.reduce((sum, day) => {
      const key = format(day, "yyyy-MM-dd");
      return sum + (dailyHoursMap[key]?.[developerId] ?? 0);
    }, 0);
  }

  /** Max daily hours for a developer+assignment combination if placed in range */
  function getMaxDailyForDeveloper(developerId: number, visibleDays: string[]): number {
    return Math.max(0, ...visibleDays.map((d) => dailyHoursMap[d]?.[developerId] ?? 0));
  }

  function isOverloaded(developerId: number, date: string, threshold = 8): boolean {
    return getHoursForDay(developerId, date) > threshold;
  }

  function wouldOverload(
    developerId: number,
    start: string,
    end: string,
    additionalHours: number,
    threshold = 8
  ): { overloads: boolean; maxHours: number } {
    const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });
    let maxHours = 0;
    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      const existing = dailyHoursMap[key]?.[developerId] ?? 0;
      const total = existing + additionalHours;
      if (total > maxHours) maxHours = total;
    }
    return { overloads: maxHours > threshold, maxHours };
  }

  /** Overload check for MOVE: excludes the assignment's old dates from the map */
  function wouldOverloadAfterMove(
    moving: { developer_id: number; start_date: string; end_date: string; hours_per_day: number },
    newStart: string,
    newEnd: string,
    threshold = 8
  ): { overloads: boolean; maxHours: number } {
    const days = eachDayOfInterval({ start: parseISO(newStart), end: parseISO(newEnd) });
    let maxHours = 0;
    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      const existingTotal = dailyHoursMap[key]?.[moving.developer_id] ?? 0;
      // If this day was in the assignment's OLD range, subtract its contribution
      const wasInOldRange = moving.start_date <= key && key <= moving.end_date;
      const existingWithoutMoved = wasInOldRange
        ? Math.max(0, existingTotal - moving.hours_per_day)
        : existingTotal;
      const total = existingWithoutMoved + moving.hours_per_day;
      if (total > maxHours) maxHours = total;
    }
    return { overloads: maxHours > threshold, maxHours };
  }

  return {
    dailyHoursMap,
    getHoursForDay,
    getDeveloperHoursInRange,
    getMaxDailyForDeveloper,
    isOverloaded,
    wouldOverload,
    wouldOverloadAfterMove,
  };
}

/** Check if a date falls within a leave period */
export function isOnLeave(leaves: Leave[], developerId: number, date: string): boolean {
  return leaves.some(
    (l) => l.developer_id === developerId && l.start_date <= date && l.end_date >= date
  );
}
