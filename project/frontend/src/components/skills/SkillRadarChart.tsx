import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { type DeveloperWithSkills, type Skill } from "@/lib/api";

interface RadarDataPoint {
  skill: string;
  fullMark: number;
  [key: string]: number | string;
}

interface SkillRadarChartProps {
  developers: DeveloperWithSkills[];
  skills: Skill[];
}

const COLORS = ["#6366f1", "#f43f5e", "#22c55e", "#f59e0b", "#3b82f6"];

function buildRadarData(developers: DeveloperWithSkills[], skills: Skill[]): RadarDataPoint[] {
  return skills.map((skill) => {
    const point: RadarDataPoint = { skill: skill.name, fullMark: 5 };
    developers.forEach((dev) => {
      const entry = dev.skills.find((s) => s.skill_id === skill.id);
      point[`dev_${dev.id}`] = entry?.score ?? 0;
    });
    return point;
  });
}

export default function SkillRadarChart({ developers, skills }: SkillRadarChartProps) {
  if (!developers.length || !skills.length) return null;

  const data = buildRadarData(developers, skills);

  return (
    <ResponsiveContainer width="100%" height={340}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
        <Tooltip />
        {developers.map((dev, i) => (
          <Radar
            key={dev.id}
            name={dev.name}
            dataKey={`dev_${dev.id}`}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.15}
          />
        ))}
        {developers.length > 1 && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  );
}
