const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Developers ---
export const api = {
  developers: {
    list: (params?: { team?: string; skill_id?: number; min_score?: number }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return request<Developer[]>(`/developers${q ? `?${q}` : ""}`);
    },
    get: (id: number) => request<DeveloperWithSkills>(`/developers/${id}`),
    create: (body: DeveloperCreate) => request<Developer>("/developers", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: Partial<DeveloperCreate>) =>
      request<Developer>(`/developers/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: number) => request<void>(`/developers/${id}`, { method: "DELETE" }),
    upsertSkills: (id: number, skills: { skill_id: number; score: number }[]) =>
      request<void>(`/developers/${id}/skills`, { method: "PUT", body: JSON.stringify({ skills }) }),
  },
  skills: {
    list: (category?: string) => request<Skill[]>(`/skills${category ? `?category=${category}` : ""}`),
    create: (body: SkillCreate) => request<Skill>("/skills", { method: "POST", body: JSON.stringify(body) }),
    delete: (id: number) => request<void>(`/skills/${id}`, { method: "DELETE" }),
  },
  projects: {
    list: (status?: string) => request<Project[]>(`/projects${status ? `?status=${status}` : ""}`),
    get: (id: number) => request<Project>(`/projects/${id}`),
    create: (body: ProjectCreate) => request<Project>("/projects", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: Partial<ProjectCreate>) =>
      request<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: number) => request<void>(`/projects/${id}`, { method: "DELETE" }),
    getRequirements: (id: number) => request<SkillRequirement[]>(`/projects/${id}/requirements`),
    upsertRequirements: (id: number, body: SkillRequirementCreate[]) =>
      request<SkillRequirement[]>(`/projects/${id}/requirements`, { method: "PUT", body: JSON.stringify(body) }),
  },
};

// --- Types (mirror backend schemas) ---
export interface Developer {
  id: number;
  name: string;
  email: string;
  position: string | null;
  level: "junior" | "mid" | "senior";
  avatar_url: string | null;
  team: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeveloperSkillEntry {
  skill_id: number;
  score: number;
  name: string;
  category: string;
}

export interface DeveloperWithSkills extends Developer {
  skills: DeveloperSkillEntry[];
}

export interface DeveloperCreate {
  name: string;
  email: string;
  position?: string;
  level?: "junior" | "mid" | "senior";
  avatar_url?: string;
  team?: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  description: string | null;
}

export interface SkillCreate {
  name: string;
  category: string;
  description?: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: "draft" | "active" | "on_hold" | "completed";
  start_date: string | null;
  end_date: string | null;
  color: string;
  created_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  status?: "draft" | "active" | "on_hold" | "completed";
  start_date?: string;
  end_date?: string;
  color?: string;
}

export interface SkillRequirement {
  id: number;
  project_id: number;
  skill_id: number;
  min_score: number;
  weight: number;
}

export interface SkillRequirementCreate {
  skill_id: number;
  min_score: number;
  weight?: number;
}
