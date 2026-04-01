import { useLocation } from "react-router-dom";
import { Bell, Sun, Moon, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUIStore } from "@/stores/uiStore";

const PAGE_TITLE_KEYS: Record<string, string> = {
  "/dashboard": "nav.dashboard",
  "/developers": "nav.developers",
  "/skills": "nav.skills",
  "/scheduler": "nav.scheduler",
  "/simulator": "nav.simulator",
  "/projects": "nav.projects",
};

export default function TopBar() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useUIStore();

  const titleKey = PAGE_TITLE_KEYS[pathname] ?? "nav.dashboard";

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background shrink-0 shadow-sm">
      <h1 className="text-base font-semibold">{t(titleKey)}</h1>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggleTheme} title={t("theme.toggle")}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title={t("language.label")}>
              <Globe className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("language.label")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => i18n.changeLanguage("hu")}
              className={i18n.language === "hu" ? "bg-accent" : ""}
            >
              🇭🇺 {t("language.hu")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => i18n.changeLanguage("en")}
              className={i18n.language === "en" ? "bg-accent" : ""}
            >
              🇬🇧 {t("language.en")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" title={t("notifications.title")}>
          <Bell className="h-4 w-4" />
        </Button>

        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary ml-1">
          U
        </div>
      </div>
    </header>
  );
}
