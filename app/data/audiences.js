import { User, Briefcase, Laptop, ChartBar, Cpu } from "@phosphor-icons/react";

export const AUDIENCES = [
  {
    id: "child",
    label: "A curious 10-year-old",
    hint: "No jargon. Use tangible everyday analogies.",
    quote: "Wait, so is it like teaching a puppy new tricks?",
    focus: "Physical analogies · Intuition · No math",
  },
  {
    id: "recruiter",
    label: "A non-technical recruiter",
    hint: "Focus on user impact and team outcomes.",
    quote: "How did this technology improve user outcomes?",
    focus: "Business impact · Pragmatism · Product value",
  },
  {
    id: "junior",
    label: "A junior developer",
    hint: "Foundations first, then step-by-step mechanisms.",
    quote: "Can you walk me through the execution flow step by step?",
    focus: "Clear mental models · Syntax clarity · Edge cases",
  },
  {
    id: "executive",
    label: "A C-suite executive",
    hint: "Strategic ROI, competitive edge, and operational risk.",
    quote: "What is our competitive advantage and failure risk?",
    focus: "Risk vs return · Budget impact · High-level architecture",
  },
  {
    id: "engineer",
    label: "A senior AI engineer",
    hint: "Go straight to depth. Discuss tradeoffs and bottlenecks.",
    quote: "Which loss function did you optimize, and why not contrastive?",
    focus: "Mathematical rigor · Tradeoffs · Failure modes",
  },
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
