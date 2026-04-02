import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Trash2, CalendarRange } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Project } from "@/lib/api";
import { format, isValid } from "date-fns";

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: number) => void;
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  draft: "secondary",
  on_hold: "outline",
  completed: "outline",
};

function formatDate(d: string | null): string {
  if (!d) return "?";
  const date = new Date(d);
  return isValid(date) ? format(date, "yyyy.MM.dd") : "?";
}

export default React.memo(function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full shrink-0 mt-1"
              style={{ backgroundColor: project.color }}
            />
            <div>
              <p className="font-semibold leading-tight">{project.name}</p>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(project.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant[project.status] ?? "outline"}>
            {t(`project.statuses.${project.status}`)}
          </Badge>
          {(project.start_date || project.end_date) && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <CalendarRange className="h-3 w-3" />
              {formatDate(project.start_date)} – {formatDate(project.end_date)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
