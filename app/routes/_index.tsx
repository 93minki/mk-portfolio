import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const result = await context.cloudflare.env.DB.prepare(
    "SELECT * FROM projects ORDER BY created_at DESC"
  ).all();

  // 더 안전한 타입 단언
  return { projects: result.results };
};

export default function Index() {
  const { projects } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen items-center justify-center">
      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.id} className="border p-2 rounded">
            <h2 className="font-semibold">{project.title}</h2>
            <p>{project.description}</p>
            <small>
              {project.created_at
                ? new Date(project.created_at).toLocaleString()
                : ""}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
