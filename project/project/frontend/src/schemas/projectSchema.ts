import { z } from "zod";

export const PROJECT_STATUSES = ["draft", "active", "on_hold", "completed"] as const;

export const projectSchema = z.object({
  name: z.string().min(1, "Kötelező"),
  description: z.string().max(1000).optional(),
  status: z.enum(PROJECT_STATUSES).default("draft"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Érvénytelen szín").default("#6366f1"),
}).refine(
  (d) => !d.start_date || !d.end_date || d.start_date <= d.end_date,
  { message: "A befejezés nem lehet korábbi a kezdésnél", path: ["end_date"] }
);

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const skillRequirementSchema = z.object({
  skill_id: z.number().int().positive(),
  min_score: z.number().int().min(1).max(5),
  weight: z.number().min(0.1).max(3.0).default(1.0),
});

export type SkillRequirementFormValues = z.infer<typeof skillRequirementSchema>;
