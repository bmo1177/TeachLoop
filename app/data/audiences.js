import { User, Briefcase, Laptop, ChartBar, Cpu } from "@phosphor-icons/react";

export const AUDIENCES = [
  { id: "child", label: "A curious 10-year-old", hint: "No jargon. Use everyday analogies." },
  { id: "recruiter", label: "A non-technical recruiter", hint: "Focus on impact, not mechanisms." },
  { id: "junior", label: "A junior developer", hint: "Foundations first, then depth." },
  { id: "executive", label: "A C-suite executive", hint: "Business value over implementation." },
  { id: "engineer", label: "A senior AI engineer", hint: "Go deep. Skip the basics." },
];

export const audienceIcons = {
  child: User,
  recruiter: Briefcase,
  junior: Laptop,
  executive: ChartBar,
  engineer: Cpu,
};

export function AudienceIcon({ id, size = 20, weight = "duotone" }) {
  const Icon = audienceIcons[id];
  return Icon ? <Icon size={size} weight={weight} /> : null;
}
