import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { Developer } from "../../lib/api";
import { useTranslation } from "react-i18next";

const schema = z.object({
  leave_type: z.enum(["vacation", "sick", "other"]),
  start_date: z.string().min(1, "Kötelező"),
  end_date: z.string().min(1, "Kötelező"),
  note: z.string().max(500).optional(),
}).refine((d) => d.start_date <= d.end_date, {
  message: "A befejezés nem lehet korábbi a kezdésnél",
  path: ["end_date"],
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  developer: Developer;
  defaultStart?: string;
  onSubmit: (values: FormValues & { developer_id: number }) => void;
  isLoading?: boolean;
}

export default function LeaveForm({ open, onClose, developer, defaultStart = "", onSubmit, isLoading }: Props) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { leave_type: "vacation", start_date: defaultStart, end_date: defaultStart },
  });

  function handleClose() {
    reset();
    onClose();
  }

  function onValid(values: FormValues) {
    onSubmit({ ...values, developer_id: developer.id });
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Szabadság – {developer.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onValid)} className="space-y-3">
          <div className="space-y-1">
            <Label>Típus</Label>
            <select {...register("leave_type")} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
              <option value="vacation">Szabadság</option>
              <option value="sick">Betegszabadság</option>
              <option value="other">Egyéb távollét</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Kezdés</Label>
              <Input type="date" {...register("start_date")} />
              {errors.start_date && <p className="text-xs text-destructive">{errors.start_date.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Befejezés</Label>
              <Input type="date" {...register("end_date")} />
              {errors.end_date && <p className="text-xs text-destructive">{errors.end_date.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Megjegyzés (opcionális)</Label>
            <Input {...register("note")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={isLoading}>{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
