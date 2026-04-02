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
import type { Developer, Task, Project } from "../../lib/api";
import { useTranslation } from "react-i18next";

const schema = z.object({
  task_id: z.coerce.number().int().positive("Kötelező"),
  start_date: z.string().min(1, "Kötelező"),
  end_date: z.string().min(1, "Kötelező"),
  hours_per_day: z.coerce.number().min(0.5).max(24).default(8),
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
  tasks: Task[];
  projects: Project[];
  defaultStart?: string;
  defaultEnd?: string;
  onSubmit: (values: FormValues & { developer_id: number }) => void;
  isLoading?: boolean;
}

export default function AssignmentForm({
  open,
  onClose,
  developer,
  tasks,
  projects,
  defaultStart = "",
  defaultEnd = "",
  onSubmit,
  isLoading,
}: Props) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      start_date: defaultStart,
      end_date: defaultEnd,
      hours_per_day: 8,
    },
  });

  function handleClose() {
    reset();
    onClose();
  }

  function onValid(values: FormValues) {
    onSubmit({ ...values, developer_id: developer.id });
    handleClose();
  }

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Hozzárendelés – {developer.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onValid)} className="space-y-3">
          <div className="space-y-1">
            <Label>Feladat</Label>
            <select
              {...register("task_id")}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="">Válassz feladatot...</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  [{projectMap[t.project_id]?.name ?? "?"}] {t.title}
                </option>
              ))}
            </select>
            {errors.task_id && <p className="text-xs text-destructive">{errors.task_id.message}</p>}
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
            <Label>Óra/nap</Label>
            <Input type="number" step="0.5" {...register("hours_per_day")} />
            {errors.hours_per_day && <p className="text-xs text-destructive">{errors.hours_per_day.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Megjegyzés (opcionális)</Label>
            <Input {...register("note")} placeholder="..." />
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
