import type { TechStackPageProps } from "@/features/theme/contract/pages";
import { m } from "@/paraglide/messages";

export function TechStackPage(_props: TechStackPageProps) {
  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-6 md:px-0 py-12 md:py-20">
      <section className="space-y-10 max-w-2xl">
        {/* Page Intro */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-foreground">
            {m.nav_tech_stack()}
          </h1>
          <p className="text-base text-muted-foreground leading-[1.8]">
            {m.tech_stack_intro()}
          </p>
        </div>

        {/* Main Skills */}
        <div className="border-t border-border/40 pt-8 space-y-3">
          <h2 className="text-lg font-medium text-foreground">
            {m.tech_stack_main_skills()}
          </h2>
          <p className="text-sm text-muted-foreground leading-[1.8]">
            {m.tech_stack_main_list()}
          </p>
        </div>

        {/* Exploring */}
        <div className="border-t border-border/40 pt-8 space-y-3">
          <h2 className="text-lg font-medium text-foreground">
            {m.tech_stack_exploring()}
          </h2>
          <p className="text-sm text-muted-foreground leading-[1.8]">
            {m.tech_stack_exploring_list()}
          </p>
        </div>

        {/* Practice Sharing */}
        <div className="border-t border-border/40 pt-8 space-y-3">
          <h2 className="text-lg font-medium text-foreground">
            {m.tech_stack_practice()}
          </h2>
          <ol className="space-y-2 text-sm text-muted-foreground leading-[1.8] list-decimal ml-5">
            <li>{m.tech_stack_practice_items_1()}</li>
            <li>{m.tech_stack_practice_items_2()}</li>
            <li>{m.tech_stack_practice_items_3()}</li>
          </ol>
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
