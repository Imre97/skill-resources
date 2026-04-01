import { z } from "zod";

export const developerSchema = z.object({
  name: z.string().min(1, "Kötelező"),
  email: z.string().email("Érvénytelen email"),
  position: z.string().optional(),
  level: z.enum(["junior", "mid", "senior"]).default("mid"),
  team: z.string().optional(),
  avatar_url: z.string().url("Érvénytelen URL").optional().or(z.literal("")),
});

export type DeveloperFormValues = z.infer<typeof developerSchema>;

export const developerSkillEntrySchema = z.object({
  skill_id: z.number().int().positive(),
  score: z.number().int().min(1).max(5),
});

export const developerSkillsSchema = z.object({
  skills: z.array(developerSkillEntrySchema),
});

export type DeveloperSkillsFormValues = z.infer<typeof developerSkillsSchema>;
