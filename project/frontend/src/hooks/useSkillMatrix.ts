import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { api, type DeveloperWithSkills, type Skill, type SkillCreate } from "@/lib/api";
import { useSkillStore } from "@/stores/skillStore";

export function useSkills(category?: string) {
  return useQuery({
    queryKey: ["skills", category],
    queryFn: () => api.skills.list(category),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSkillMatrix() {
  const { data: developers, isLoading: loadingDevs, isError: errorDevs } = useQuery({
    queryKey: ["skill-matrix"],
    queryFn: async () => {
      const devs = await api.developers.list();
      const full = await Promise.all(devs.map((d) => api.developers.get(d.id)));
      return full as DeveloperWithSkills[];
    },
    staleTime: 1000 * 60,
  });

  const { data: skills, isLoading: loadingSkills } = useQuery({
    queryKey: ["skills"],
    queryFn: () => api.skills.list(),
    staleTime: 1000 * 60 * 5,
  });

  const filters = useSkillStore((s) => s.filters);

  const filteredDevelopers = useMemo(() => {
    if (!developers) return [];
    return developers.filter((dev) => {
      if (filters.search && !dev.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category && filters.minScore > 0) {
        const skillsInCategory = dev.skills.filter(
          (sk) => sk.category === filters.category && sk.score >= filters.minScore
        );
        return skillsInCategory.length > 0;
      }
      return true;
    });
  }, [developers, filters]);

  const filteredSkills = useMemo(() => {
    if (!skills) return [];
    if (!filters.category) return skills;
    return skills.filter((s: Skill) => s.category === filters.category);
  }, [skills, filters.category]);

  return {
    developers: filteredDevelopers,
    allDevelopers: developers ?? [],
    skills: filteredSkills,
    allSkills: skills ?? [],
    isLoading: loadingDevs || loadingSkills,
    isError: errorDevs,
  };
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SkillCreate) => api.skills.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["skill-matrix"] });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.skills.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["skill-matrix"] });
    },
  });
}

export function useSkillRadarData(developer: DeveloperWithSkills | undefined, skills: Skill[]) {
  return useMemo(() => {
    if (!developer || !skills.length) return [];
    return skills.map((skill) => {
      const entry = developer.skills.find((s) => s.skill_id === skill.id);
      return { skill: skill.name, score: entry?.score ?? 0, fullMark: 5 };
    });
  }, [developer, skills]);
}
