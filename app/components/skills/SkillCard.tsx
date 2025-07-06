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
      className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-400 text-center"
    >
      {iconUrl && (
        <div className="mb-3">
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
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
        {skill.name}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
        {skill.category}
      </p>
    </div>
  );
}
