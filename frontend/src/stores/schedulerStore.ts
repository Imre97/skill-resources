import { create } from "zustand";
import type { Assignment, Leave } from "../lib/api";

export type ViewMode = "week" | "two-week" | "month";

interface SchedulerStore {
  assignments: Assignment[];
  leaves: Leave[];
  viewMode: ViewMode;
  dateRangeStart: string; // ISO date string

  setAssignments: (a: Assignment[]) => void;
  addAssignment: (a: Assignment) => void;
  updateAssignment: (id: number, patch: Partial<Assignment>) => void;
  deleteAssignment: (id: number) => void;

  setLeaves: (l: Leave[]) => void;
  addLeave: (l: Leave) => void;
  deleteLeave: (id: number) => void;

  setViewMode: (m: ViewMode) => void;
  setDateRangeStart: (d: string) => void;
}

function todayIso(): string {
  const d = new Date();
  // Snap to start of current week (Monday)
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

export const useSchedulerStore = create<SchedulerStore>((set) => ({
  assignments: [],
  leaves: [],
  viewMode: "two-week",
  dateRangeStart: todayIso(),

  setAssignments: (a) => set({ assignments: a }),
  addAssignment: (a) => set((s) => ({ assignments: [...s.assignments, a] })),
  updateAssignment: (id, patch) =>
    set((s) => ({
      assignments: s.assignments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),
  deleteAssignment: (id) =>
    set((s) => ({ assignments: s.assignments.filter((a) => a.id !== id) })),

  setLeaves: (l) => set({ leaves: l }),
  addLeave: (l) => set((s) => ({ leaves: [...s.leaves, l] })),
  deleteLeave: (id) => set((s) => ({ leaves: s.leaves.filter((l) => l.id !== id) })),

  setViewMode: (m) => set({ viewMode: m }),
  setDateRangeStart: (d) => set({ dateRangeStart: d }),
}));
