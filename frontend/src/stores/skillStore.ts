import { create } from "zustand";

export type SkillCategory = "frontend" | "backend" | "devops" | "soft" | "other" | "";

export interface SkillFilter {
  category: SkillCategory;
  minScore: number;
  search: string;
}

interface SkillStore {
  selectedDeveloperIds: number[];
  filters: SkillFilter;
  toggleDeveloperSelection: (id: number) => void;
  clearSelection: () => void;
  setFilters: (f: Partial<SkillFilter>) => void;
  resetFilters: () => void;
}

const defaultFilters: SkillFilter = { category: "", minScore: 0, search: "" };

export const useSkillStore = create<SkillStore>((set) => ({
  selectedDeveloperIds: [],
  filters: defaultFilters,
  toggleDeveloperSelection: (id) =>
    set((s) => ({
      selectedDeveloperIds: s.selectedDeveloperIds.includes(id)
        ? s.selectedDeveloperIds.filter((x) => x !== id)
        : [...s.selectedDeveloperIds, id],
    })),
  clearSelection: () => set({ selectedDeveloperIds: [] }),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
