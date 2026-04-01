import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

interface UIStore {
  sidebarCollapsed: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: "light",
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        applyTheme(next);
        set({ theme: next });
      },
    }),
    { name: "nexus-ui" }
  )
);

// Apply persisted theme immediately on module load (before first render)
try {
  const stored = localStorage.getItem("nexus-ui");
  if (stored) {
    const { state } = JSON.parse(stored) as { state: Partial<UIStore> };
    if (state?.theme) applyTheme(state.theme);
  }
} catch {
  // ignore
}
