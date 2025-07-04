import { Skill } from "~/types/skill";

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  return (
    <div
      key={skill.id}
      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200 text-center"
    >
      <h3 className="text-xs font-medium text-gray-900 mb-1">{skill.name}</h3>
      <p className="text-xs text-gray-500 capitalize">{skill.category}</p>
    </div>
  );
}
