import { useRouteContext } from "@tanstack/react-router";
import type { AboutPageProps } from "@/features/theme/contract/pages";
import { m } from "@/paraglide/messages";

export function AboutPage(_props: AboutPageProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-6 md:px-0 py-12 md:py-20">
      <section className="space-y-8 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-foreground">
          {m.nav_lab()}
        </h1>

        <p className="text-base md:text-lg text-muted-foreground leading-[1.8]">
          {m.lab_intro()}
        </p>

        <div className="border-t border-border/40 pt-8 space-y-4">
          <p className="text-sm text-muted-foreground leading-[1.8] font-medium">
            {m.lab_notes_title()}
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-[1.8]">
            <li>{m.lab_notes_1()}</li>
            <li>{m.lab_notes_2()}</li>
            <li>{m.lab_notes_3()}</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-[1.8]">
            {siteConfig.description}
          </p>
        </div>
      </section>
    </div>
  );
}
