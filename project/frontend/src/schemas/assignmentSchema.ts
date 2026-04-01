import { z } from "zod";

export const assignmentSchema = z.object({
  developer_id: z.number().int().positive(),
  task_id: z.number().int().positive(),
  start_date: z.string().min(1, "Kötelező"),
  end_date: z.string().min(1, "Kötelező"),
  hours_per_day: z.number().min(0.5).max(24).default(8),
  note: z.string().max(500).optional(),
}).refine((d) => d.start_date <= d.end_date, {
  message: "A befejezés nem lehet korábbi a kezdésnél",
  path: ["end_date"],
});

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export const taskSchema = z.object({
  project_id: z.number().int().positive(),
  title: z.string().min(1, "Kötelező"),
  description: z.string().max(1000).optional(),
  estimated_hours: z.number().min(0.5).default(8),
  status: z.enum(["open", "in_progress", "done"]).default("open"),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
