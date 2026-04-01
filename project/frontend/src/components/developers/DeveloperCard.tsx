import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Trash2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Developer } from "@/lib/api";

interface DeveloperCardProps {
  developer: Developer;
  onDelete?: (id: number) => void;
}

const levelVariant: Record<string, "default" | "secondary" | "outline"> = {
  senior: "default",
  mid: "secondary",
  junior: "outline",
};

export default React.memo(function DeveloperCard({ developer, onDelete }: DeveloperCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/developers/${developer.id}`)}
    >
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
              {developer.avatar_url ? (
                <img
                  src={developer.avatar_url}
                  alt={developer.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-semibold leading-tight">{developer.name}</p>
              <p className="text-sm text-muted-foreground">{developer.position ?? "–"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(developer.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant={levelVariant[developer.level] ?? "outline"}>
            {t(`developer.levels.${developer.level}`)}
          </Badge>
          {developer.team && (
            <Badge variant="outline">{developer.team}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
