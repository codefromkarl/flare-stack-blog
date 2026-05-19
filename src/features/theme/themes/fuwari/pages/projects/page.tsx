import type { ProjectsPageProps } from "@/features/theme/contract/pages";

export function ProjectsPage(_props: ProjectsPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-3xl font-medium text-foreground mb-4">
        Projects
      </h1>
      <p className="text-muted-foreground">Coming soon...</p>
    </div>
  );
}
