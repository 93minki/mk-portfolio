import { Experience } from "~/types/experience";

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    const [year, month] = dateString.split("-");
    return `${year}.${month}`;
  };

  // 기간 계산 함수
  const getPeriod = (): string => {
    const startDate = formatDate(experience.start_date);
    if (experience.is_current || !experience.end_date) {
      return `${startDate} - 현재`;
    }
    const endDate = formatDate(experience.end_date);
    return `${startDate} - ${endDate}`;
  };

  // 업무 설명을 배열로 변환 (줄바꿈 기준)
  const getDescriptions = (): string[] => {
    if (!experience.description) return [];
    return experience.description.split("\n").filter((line) => line.trim());
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
        <div className="mb-2 md:mb-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {experience.position}
          </h3>
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            {experience.company_name}
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 md:text-right">
          <p className="font-medium">{getPeriod()}</p>
          {experience.location && (
            <p className="flex items-center mt-1 md:justify-end">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {experience.location}
            </p>
          )}
        </div>
      </div>

      {experience.description && (
        <div className="text-gray-600 dark:text-gray-300">
          <ul className="space-y-1">
            {getDescriptions().map((desc, index) => (
              <li key={index} className="text-sm leading-relaxed">
                {desc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {experience.is_current && (
        <div className="mt-4">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
            현재 근무중
          </span>
        </div>
      )}
    </div>
  );
}
