import { useRouteContext } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NavigationMenuItem } from "@/features/config/site-config.schema";
import type { PostsPageProps } from "@/features/theme/contract/pages";
import { PostItem } from "@/features/theme/themes/default/components/post-item";
import {
  PostsSidebar,
  type SidebarNavItem,
} from "@/features/theme/themes/default/components/posts-sidebar";
import { authClient } from "@/lib/auth/auth.client";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

function getCategoryId(name: string) {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `category-${normalized || "uncategorized"}`;
}

function toSidebarNavItems(
  menuItems: Array<NavigationMenuItem>,
  isAuthenticated: boolean,
  role: string | null | undefined,
): Array<SidebarNavItem> {
  return menuItems
    .filter(
      (item) =>
        item.visible !== false && hasMenuAccess(item, isAuthenticated, role),
    )
    .flatMap((item): Array<SidebarNavItem> => {
      const children = item.children
        ? toSidebarNavItems(item.children, isAuthenticated, role)
        : undefined;

      if (item.type === "internal" && item.to) {
        return [
          {
            id: item.id,
            label: resolveBuiltinNavLabel(item),
            type: "internal",
            to: item.to,
            children,
          },
        ];
      }

      if (item.type === "external" && item.url) {
        return [
          {
            id: item.id,
            label: resolveBuiltinNavLabel(item),
            type: "external",
            url: item.url,
            children,
          },
        ];
      }

      if (item.type === "anchor" && item.anchorId) {
        return [
          {
            id: item.id,
            label: resolveBuiltinNavLabel(item),
            type: "anchor",
            anchorId: item.anchorId,
            children,
          },
        ];
      }

      return [];
    });
}

function hasMenuAccess(
  item: NavigationMenuItem,
  isAuthenticated: boolean,
  role: string | null | undefined,
) {
  const access = item.access ?? "public";
  if (access === "authenticated") {
    return isAuthenticated;
  }
  if (access === "admin") {
    return role === "admin";
  }
  return true;
}

function resolveBuiltinNavLabel(item: NavigationMenuItem) {
  switch (item.id) {
    case "home":
      return m.nav_home();
    case "posts":
      return m.nav_posts();
    case "about":
    case "lab":
      return m.nav_lab();
    case "tech-stack":
      return m.nav_tech_stack();
    case "links":
      return m.nav_friend_links();
    default:
      return item.title;
  }
}

export function PostsPage({
  posts,
  tags,
  selectedTag: _selectedTag,
  onTagClick: _onTagClick,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: PostsPageProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const { data: session } = authClient.useSession();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] =
    useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string>();
  const observerRef = useRef<HTMLDivElement>(null);
  const uncategorizedLabel = m.posts_uncategorized();

  const isAuthenticated = Boolean(session?.user);
  const role = session?.user?.role;
  const managedSiteNavItems = toSidebarNavItems(
    siteConfig.navigation.postsIndex,
    isAuthenticated,
    role,
  );
  const siteNavItems =
    managedSiteNavItems.length > 0
      ? managedSiteNavItems
      : ([
          { id: "home", label: m.nav_home(), type: "internal", to: "/" },
          {
            id: "posts",
            label: m.nav_posts(),
            type: "internal",
            to: "/posts",
          },
          {
            id: "links",
            label: m.nav_friend_links(),
            type: "internal",
            to: "/friend-links",
          },
        ] as Array<SidebarNavItem>);

  const groupedCategories = useMemo(() => {
    const groupMap = new Map<string, PostsPageProps["posts"]>();

    for (const post of posts) {
      const categoryName = post.tags?.[0]?.name?.trim() || uncategorizedLabel;
      const existing = groupMap.get(categoryName) ?? [];
      existing.push(post);
      groupMap.set(categoryName, existing);
    }

    const orderedNames = [
      ...new Set([...tags.map((tag) => tag.name), ...groupMap.keys()]),
    ].filter((name) => groupMap.has(name));

    const idCounter = new Map<string, number>();

    return orderedNames.map((name) => {
      const baseId = getCategoryId(name);
      const nextCount = (idCounter.get(baseId) ?? 0) + 1;
      idCounter.set(baseId, nextCount);
      const id = nextCount === 1 ? baseId : `${baseId}-${nextCount}`;

      return {
        id,
        name,
        posts: groupMap.get(name) ?? [],
        count: (groupMap.get(name) ?? []).length,
      };
    });
  }, [posts, tags, uncategorizedLabel]);

  useEffect(() => {
    setActiveCategoryId((current) => {
      if (
        current &&
        groupedCategories.some((category) => category.id === current)
      ) {
        return current;
      }

      return groupedCategories[0]?.id;
    });
  }, [groupedCategories]);

  useEffect(() => {
    const sections = groupedCategories
      .map((category) => document.getElementById(category.id))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            if (b.intersectionRatio !== a.intersectionRatio) {
              return b.intersectionRatio - a.intersectionRatio;
            }

            return a.boundingClientRect.top - b.boundingClientRect.top;
          });

        if (visible.length > 0) {
          setActiveCategoryId((visible[0].target as HTMLElement).id);
          return;
        }

        const nearest = sections
          .filter((section) => section.getBoundingClientRect().top <= 180)
          .at(-1);

        if (nearest) {
          setActiveCategoryId(nearest.id);
        }
      },
      {
        threshold: [0.1, 0.35, 0.6],
        rootMargin: "-18% 0px -62% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [groupedCategories]);

  const handleCategoryClick = (categoryId: string) => {
    const section = document.getElementById(categoryId);
    if (!section) {
      return;
    }

    setActiveCategoryId(categoryId);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsMobileSidebarOpen(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "0px" },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="w-full max-w-[1280px] mx-auto pb-20 px-6 md:px-8 lg:px-10">
      <div className="lg:hidden py-4">
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.14em] uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          {isMobileSidebarOpen ? <X size={14} /> : <Menu size={14} />}
          <span>
            {isMobileSidebarOpen
              ? m.posts_sidebar_mobile_close()
              : m.posts_sidebar_mobile_toggle()}
          </span>
        </button>

        {isMobileSidebarOpen && (
          <PostsSidebar
            className="mt-4 border-b border-border/40 pb-4"
            siteNavItems={siteNavItems}
            totalPosts={posts.length}
            totalTags={tags.length}
            categories={groupedCategories}
            activeCategoryId={activeCategoryId}
            onCategoryClick={handleCategoryClick}
            onNavigate={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </div>

      <div
        className={cn(
          "grid grid-cols-1 items-start gap-8",
          isDesktopSidebarCollapsed
            ? "lg:grid-cols-[2.5rem_minmax(0,1fr)] lg:gap-6"
            : "lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8",
        )}
      >
        <aside className="hidden lg:block sticky top-24 max-h-[calc(100vh-7rem)] pr-2">
          <div className="space-y-4">
            <button
              type="button"
              onClick={() =>
                setIsDesktopSidebarCollapsed((collapsed) => !collapsed)
              }
              className="inline-flex w-full items-center justify-between rounded-md border border-border/30 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>
                {isDesktopSidebarCollapsed
                  ? m.posts_sidebar_expand()
                  : m.posts_sidebar_collapse()}
              </span>
              {isDesktopSidebarCollapsed ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronLeft size={14} />
              )}
            </button>

            {!isDesktopSidebarCollapsed && (
              <div className="max-h-[calc(100vh-11rem)] overflow-y-auto">
                <PostsSidebar
                  siteNavItems={siteNavItems}
                  totalPosts={posts.length}
                  totalTags={tags.length}
                  categories={groupedCategories}
                  activeCategoryId={activeCategoryId}
                  onCategoryClick={handleCategoryClick}
                />
              </div>
            )}
          </div>
        </aside>

        <section className="min-w-0">
          <header className="py-8 md:py-12 space-y-4">
            <h1 className="text-[2rem] md:text-[2.2rem] font-serif font-medium tracking-tight text-foreground">
              {m.nav_posts()}
            </h1>
            <p className="max-w-[48rem] text-sm md:text-base font-light text-muted-foreground leading-7">
              {m.posts_index_intro({
                description: siteConfig.description,
              })}
            </p>
          </header>

          {groupedCategories.length === 0 ? (
            <div className="py-20 text-left">
              <p className="font-serif text-xl text-muted-foreground/50">
                {m.posts_no_posts()}
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {groupedCategories.map((category) => (
                <section
                  id={category.id}
                  key={category.id}
                  className="scroll-mt-28 space-y-4"
                >
                  <header className="flex items-end justify-between gap-3 border-b border-border/40 pb-2">
                    <h2 className="text-xl md:text-2xl font-serif font-medium tracking-tight text-foreground">
                      {category.name}
                    </h2>
                    <span className="text-xs font-mono text-muted-foreground/70">
                      {m.posts_count({ count: category.count })}
                    </span>
                  </header>

                  <div className="border-t border-border/40">
                    {category.posts.map((post) => (
                      <PostItem key={post.id} post={post} compact />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <div
            ref={observerRef}
            className="py-16 flex flex-col items-center justify-center gap-6"
          >
            {isFetchingNextPage ? (
              <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500 fill-mode-both">
                <div className="w-1.5 h-1.5 bg-foreground animate-ping" />
                <span className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground uppercase">
                  {m.posts_loading()}
                </span>
              </div>
            ) : hasNextPage ? (
              <div className="h-px w-24 bg-border/40"></div>
            ) : posts.length > 0 ? (
              <div className="flex items-center gap-4 text-muted-foreground/20">
                <span className="h-px w-12 bg-current" />
                <span className="text-lg font-serif italic">
                  {m.posts_end()}
                </span>
                <span className="h-px w-12 bg-current" />
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
