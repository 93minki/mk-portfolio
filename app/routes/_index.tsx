import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import ExperienceCard from "~/components/experience/ExperienceCard";
import SkillCard from "~/components/skills/SkillCard";
import ProjectCard from "~/components/ui/ProjectCard";
import { Experience } from "~/types/experience";
import { PersonalInfo } from "~/types/personal_info";
import type { Project } from "~/types/project";
import { Skill } from "~/types/skill";

export const meta: MetaFunction = () => {
  return [
    { title: "김민기 - Frontend Developer" },
    {
      name: "description",
      content:
        "React와 TypeScript를 주로 사용하는 프론트엔드 개발자 포트폴리오",
    },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const [projects, personalInfoRaw, skillsRaw, experiencesRaw] =
    await Promise.all([
      context.cloudflare.env.DB.prepare(
        "SELECT * FROM projects WHERE featured = 1 ORDER BY order_index ASC, created_at DESC LIMIT 6"
      ).all(),
      context.cloudflare.env.DB.prepare("SELECT * FROM personal_info").all(),
      context.cloudflare.env.DB.prepare("SELECT * FROM skills").all(),
      context.cloudflare.env.DB.prepare(
        "SELECT * FROM experiences ORDER BY order_index ASC, start_date DESC"
      ).all(),
    ]);

  const personalInfo = (
    personalInfoRaw.results as unknown as PersonalInfo[]
  ).reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<string, string>);

  // 스킬 전체 정보를 그대로 전달
  const skills = skillsRaw.results as unknown as Skill[];

  // 경력 정보 전달
  const experiences = experiencesRaw.results as unknown as Experience[];

  return {
    projects: projects.results as unknown as Project[],
    personalInfo,
    skills,
    experiences,
  };
};

export default function Index() {
  const { projects, personalInfo, skills, experiences } =
    useLoaderData<typeof loader>();

  // 개인정보 기본값 처리
  const getName = () => personalInfo.name || "김민기";
  const getBio = () =>
    personalInfo.bio || "사용자 경험을 중시하는 Frontend Developer입니다.";
  const getLocation = () => personalInfo.location || "Seoul, South Korea";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              구직중
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              <span className="block">안녕하세요,</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {getName()}입니다
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {getBio()}
              <br className="hidden md:block" />
              <span className="inline-flex items-center mt-2 text-lg text-gray-500">
                <svg
                  className="w-5 h-5 mr-2"
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
                {getLocation()}
              </span>
            </p>

            {/* 소셜 링크 추가 */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {personalInfo.email && (
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-white/60 backdrop-blur-sm text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Contact
                </a>
              )}
              {personalInfo.github && (
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-white/60 backdrop-blur-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              )}
              {personalInfo.velog && (
                <a
                  href={personalInfo.velog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-white/60 backdrop-blur-sm text-gray-700 hover:text-green-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="11" fill="#20C997" />
                    <path
                      d="M10.5 6L7 18h1.5l3.5-12L15.5 18H17L13.5 6h-3z"
                      fill="white"
                    />
                  </svg>
                  Velog
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Featured Projects */}
      <div id="projects" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600">
            최근 작업한 프로젝트들을 소개합니다
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              아직 프로젝트가 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              관리자 페이지에서 첫 번째 프로젝트를 추가해보세요!
            </p>
            <a
              href="/admin/projects/new"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              프로젝트 추가하기
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
      {/* Experience & Career */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Experience & Career
          </h2>
          <p className="text-xl text-gray-600">
            함께 성장해온 경력과 경험들입니다
          </p>
        </div>

        {experiences.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6m8 0H8"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              아직 경력이 등록되지 않았습니다
            </h3>
            <p className="text-gray-600 mb-6">
              관리자 페이지에서 경력을 추가해보세요!
            </p>
            <a
              href="/admin"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              관리자 페이지로 이동
            </a>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {experiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        )}
      </div>
      {/* Skills & Technologies */}
      <div className="bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Skills & Technologies
            </h2>
            <p className="text-lg text-gray-600">
              저와 함께 작업할 수 있는 기술 스택입니다
            </p>
          </div>

          {skills.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                아직 스킬이 등록되지 않았습니다
              </h3>
              <p className="text-gray-600 mb-4">
                관리자 페이지에서 기술 스택을 추가해보세요!
              </p>
              <a
                href="/admin"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                관리자 페이지로 이동
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
