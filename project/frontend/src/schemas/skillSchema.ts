import { z } from "zod";

export const SKILL_CATEGORIES = ["frontend", "backend", "devops", "soft", "other"] as const;

export const skillSchema = z.object({
  name: z.string().min(1, "Kötelező"),
  category: z.enum(SKILL_CATEGORIES, { errorMap: () => ({ message: "Érvénytelen kategória" }) }),
  description: z.string().max(300).optional(),
});

export type SkillFormValues = z.infer<typeof skillSchema>;

export const skillFilterSchema = z.object({
  category: z.enum(SKILL_CATEGORIES).optional(),
  min_score: z.number().int().min(1).max(5).optional(),
  search: z.string().optional(),
});

export type SkillFilterValues = z.infer<typeof skillFilterSchema>;
