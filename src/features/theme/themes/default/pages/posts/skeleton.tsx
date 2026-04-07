import { useRouteContext } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";

export function PostsPageSkeleton() {
  const { siteConfig } = useRouteContext({ from: "__root__" });

  return (
    <div className="w-full max-w-[1280px] mx-auto pb-20 px-6 md:px-8 lg:px-10">
      <div className="lg:hidden py-4">
        <Skeleton className="h-6 w-28 rounded-none bg-muted/50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[17rem_minmax(0,1fr)] gap-8 lg:gap-8 items-start">
        <aside className="hidden lg:block sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-3 w-14 rounded-none bg-muted/50" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded-none bg-muted/45" />
                <Skeleton className="h-4 w-20 rounded-none bg-muted/45" />
                <Skeleton className="h-4 w-20 rounded-none bg-muted/45" />
              </div>
            </div>
            <div className="h-px w-full bg-border/40" />
            <div className="space-y-3">
              <Skeleton className="h-3 w-18 rounded-none bg-muted/50" />
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-4 w-24 rounded-none bg-muted/45"
                />
              ))}
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="py-8 md:py-12 space-y-4">
            <h1 className="text-[2rem] md:text-[2.2rem] font-serif font-medium tracking-tight text-foreground">
              {m.nav_posts()}
            </h1>
            <p className="max-w-[48rem] text-sm md:text-base font-light text-muted-foreground leading-7">
              {siteConfig.description}
            </p>
          </header>

          <div className="space-y-12">
            {Array.from({ length: 3 }).map((_, categoryIndex) => (
              <section key={categoryIndex} className="space-y-4">
                <div className="flex items-end justify-between gap-3 border-b border-border/40 pb-2">
                  <Skeleton className="h-7 w-40 rounded-none bg-muted/60" />
                  <Skeleton className="h-3 w-20 rounded-none bg-muted/45" />
                </div>

                <div className="border-t border-border/40">
                  {Array.from({ length: 3 }).map((__, postIndex) => (
                    <div
                      key={`${categoryIndex}-${postIndex}`}
                      className="border-b border-border/40 py-6 md:py-7 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Skeleton className="h-3 w-36 rounded-none bg-muted/50" />
                        <Skeleton className="h-3 w-20 rounded-none bg-muted/45" />
                      </div>
                      <Skeleton className="h-6 w-3/5 rounded-none bg-muted/65" />
                      <Skeleton className="h-4 w-5/6 rounded-none bg-muted/40" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="py-16 flex flex-col items-center justify-center gap-6 opacity-50">
            <div className="h-px w-24 bg-border/40"></div>
          </div>
        </section>
      </div>
    </div>
  );
}
