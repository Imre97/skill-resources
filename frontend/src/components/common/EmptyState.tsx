import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message?: string;
  className?: string;
}

export default function EmptyState({ message, className }: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-muted-foreground", className)}>
      <p className="text-sm">{message ?? t("common.empty")}</p>
    </div>
  );
}
