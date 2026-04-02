import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  hours: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function OverloadWarningDialog({ open, hours, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            {t("scheduler.overload")}
          </DialogTitle>
          <DialogDescription>
            {t("scheduler.overloadWarning", { hours: hours.toFixed(1) })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Igen, folytatom
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
