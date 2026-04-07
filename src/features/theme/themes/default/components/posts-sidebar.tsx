import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

export type SidebarNavItem =
  | {
      id: string;
      label: string;
      type: "internal";
      to: string;
      children?: Array<SidebarNavItem>;
    }
  | {
      id: string;
      label: string;
      type: "external";
      url: string;
      children?: Array<SidebarNavItem>;
    }
  | {
      id: string;
      label: string;
      type: "anchor";
      anchorId: string;
      children?: Array<SidebarNavItem>;
    };

export interface SidebarCategoryItem {
  id: string;
  name: string;
  count: number;
}

interface PostsSidebarProps {
  siteNavItems: Array<SidebarNavItem>;
  totalPosts: number;
  totalTags: number;
  categories: Array<SidebarCategoryItem>;
  activeCategoryId?: string;
  onCategoryClick: (categoryId: string) => void;
  onNavigate?: () => void;
  className?: string;
}

function NavItem({
  item,
  depth,
  onNavigate,
}: {
  item: SidebarNavItem;
  depth: number;
  onNavigate?: () => void;
}) {
  const baseClassName = cn(
    "relative inline-flex w-fit items-center pb-1 text-[13px] font-mono text-muted-foreground transition-colors group hover:text-foreground",
    depth > 0 && "text-[12px] pl-4",
  );

  const children =
    item.children && item.children.length > 0 ? (
      <div className="mt-2 space-y-2 border-l border-border/30 pl-2">
        {item.children.map((child) => (
          <NavItem
            key={child.id}
            item={child}
            depth={depth + 1}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    ) : null;

  if (item.type === "internal") {
    return (
      <div>
        <Link
          to={item.to as never}
          onClick={onNavigate}
          className={baseClassName}
          activeProps={{ className: "text-foreground" }}
        >
          {item.label}
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-foreground transition-all duration-200 group-hover:w-full group-aria-[current=page]:w-full" />
        </Link>
        {children}
      </div>
    );
  }

  if (item.type === "external") {
    return (
      <div>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          onClick={onNavigate}
          className={baseClassName}
        >
          {item.label}
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-foreground transition-all duration-200 group-hover:w-full" />
        </a>
        {children}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const section = document.getElementById(item.anchorId);
          if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          onNavigate?.();
        }}
        className={baseClassName}
      >
        {item.label}
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-foreground transition-all duration-200 group-hover:w-full" />
      </button>
      {children}
    </div>
  );
}

export function PostsSidebar({
  siteNavItems,
  totalPosts,
  totalTags,
  categories,
  activeCategoryId,
  onCategoryClick,
  onNavigate,
  className,
}: PostsSidebarProps) {
  return (
    <aside className={cn("w-full", className)}>
      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-xs font-medium tracking-[0.14em] uppercase text-muted-foreground/65">
            {m.posts_sidebar_stats()}
          </h2>
          <div className="space-y-2 text-[13px] font-mono text-muted-foreground">
            <div className="flex items-baseline justify-between">
              <span>{m.posts_sidebar_total_posts()}</span>
              <span className="text-xs opacity-45">{totalPosts}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span>{m.posts_sidebar_total_tags()}</span>
              <span className="text-xs opacity-45">{totalTags}</span>
            </div>
          </div>
        </section>

        <div className="border-b border-border/40" />

        <section className="space-y-3">
          <h2 className="text-xs font-medium tracking-[0.14em] uppercase text-muted-foreground/65">
            {m.posts_sidebar_nav()}
          </h2>
          <div className="flex flex-col gap-2">
            {siteNavItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                depth={0}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>

        <div className="border-b border-border/40" />

        <section className="space-y-3">
          <h2 className="text-xs font-medium tracking-[0.14em] uppercase text-muted-foreground/65">
            {m.posts_sidebar_categories()}
          </h2>
          <div className="flex flex-col gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryClick(category.id)}
                className={cn(
                  "relative inline-flex w-fit items-baseline gap-1.5 pb-1 text-[13px] font-mono text-muted-foreground transition-colors group",
                  activeCategoryId === category.id && "text-foreground",
                )}
              >
                <span>{category.name}</span>
                <span className="text-xs opacity-40">{category.count}</span>
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300",
                    activeCategoryId === category.id
                      ? "w-full"
                      : "w-0 group-hover:w-full",
                  )}
                />
              </button>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
