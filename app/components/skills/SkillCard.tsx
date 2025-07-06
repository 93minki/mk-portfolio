import { Skill } from "~/types/skill";

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const iconUrl = skill.icon_name
    ? `https://cdn.simpleicons.org/${skill.icon_name}`
    : null;

  return (
    <div
      key={skill.id}
      className="flex items-center bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200 text-center "
    >
      {iconUrl && (
        <div className="mr-2">
          <img
            src={iconUrl}
            alt={`${skill.name} icon`}
            className="w-8 h-8 mx-auto"
            onError={(e) => {
              // 아이콘 로드 실패 시 숨기기
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
      <h3 className="text-sm font-medium text-gray-900">{skill.name}</h3>
    </div>
  );
}
