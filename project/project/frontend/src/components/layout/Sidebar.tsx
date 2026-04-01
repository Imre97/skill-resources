import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  CalendarRange,
  Shuffle,
  FolderKanban,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUIStore } from "@/stores/uiStore";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/developers", label: "Fejlesztők", icon: Users },
  { to: "/skills", label: "Skill Matrix", icon: BrainCircuit },
  { to: "/scheduler", label: "Scheduler", icon: CalendarRange },
  { to: "/simulator", label: "Team Simulator", icon: Shuffle },
  { to: "/projects", label: "Projektek", icon: FolderKanban },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex items-center justify-between h-14 px-3 shrink-0">
        {!sidebarCollapsed && (
          <span className="font-bold text-sm tracking-wide truncate">Nexus</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")} />
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
