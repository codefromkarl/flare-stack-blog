import type { TechStackPageProps } from "@/features/theme/contract/pages";
import { m } from "@/paraglide/messages";

const categories = [
  { label: () => m.tech_stack_lang(), items: () => m.tech_stack_lang_list() },
  {
    label: () => m.tech_stack_frontend(),
    items: () => m.tech_stack_frontend_list(),
  },
  {
    label: () => m.tech_stack_backend(),
    items: () => m.tech_stack_backend_list(),
  },
  { label: () => m.tech_stack_ops(), items: () => m.tech_stack_ops_list() },
  { label: () => m.tech_stack_ai(), items: () => m.tech_stack_ai_list() },
] as const;

const projects = [
  {
    title: () => m.tech_stack_project_1_title(),
    desc: () => m.tech_stack_project_1_desc(),
  },
  {
    title: () => m.tech_stack_project_2_title(),
    desc: () => m.tech_stack_project_2_desc(),
  },
  {
    title: () => m.tech_stack_project_3_title(),
    desc: () => m.tech_stack_project_3_desc(),
  },
] as const;

export function TechStackPage(_props: TechStackPageProps) {
  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-6 md:px-0 py-12 md:py-20">
      <section className="space-y-10 max-w-2xl">
        {/* Intro */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-foreground">
            {m.nav_tech_stack()}
          </h1>
          <p className="text-base text-muted-foreground leading-[1.8]">
            {m.tech_stack_intro()}
          </p>
        </div>

        {/* Core Tech Stack */}
        <div className="border-t border-border/40 pt-8 space-y-6">
          <h2 className="text-lg font-medium text-foreground">
            {m.tech_stack_core_tech()}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((cat, i) => (
              <div
                key={`cat-${i}`}
                className="rounded-lg border border-border/50 bg-card/50 px-4 py-3 space-y-1.5"
              >
                <p className="text-xs font-medium text-foreground/70 uppercase tracking-wider">
                  {cat.label()}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cat.items()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Projects */}
        <div className="border-t border-border/40 pt-8 space-y-6">
          <h2 className="text-lg font-medium text-foreground">
            {m.tech_stack_projects()}
          </h2>
          <div className="space-y-4">
            {projects.map((proj, i) => (
              <div
                key={`proj-${i}`}
                className="rounded-lg border border-border/50 bg-card/50 px-4 py-3 space-y-1"
              >
                <p className="text-sm font-medium text-foreground">
                  {proj.title()}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {proj.desc()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="border-t border-border/40 pt-8 space-y-3">
          <h2 className="text-lg font-medium text-foreground">
            {m.tech_stack_contact()}
          </h2>
          <p className="text-sm text-muted-foreground leading-[1.8]">
            {m.tech_stack_contact_desc()}
          </p>
        </div>
      </section>
    </div>
  );
}
