import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/developers": "Fejlesztők",
  "/skills": "Skill Matrix",
  "/scheduler": "Scheduler",
  "/simulator": "Team Simulator",
  "/projects": "Projektek",
};

export default function TopBar() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? "Nexus";

  return (
    <header className="h-14 border-b flex items-center justify-between px-6 bg-background shrink-0">
      <h1 className="text-base font-semibold">{title}</h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
          U
        </div>
      </div>
    </header>
  );
}
