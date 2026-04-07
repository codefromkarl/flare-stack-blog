import { useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouteContext,
} from "@tanstack/react-router";
import theme from "@theme";
import { useEffect } from "react";
import { toast } from "sonner";
import { AUTH_KEYS } from "@/features/auth/queries";
import type { NavigationMenuItem } from "@/features/config/site-config.schema";
import { getThemePreloadImages } from "@/features/theme/site-config.helpers";
import { authClient } from "@/lib/auth/auth.client";
import { getLogoutAuthErrorMessage } from "@/lib/auth/auth-errors";
import { CACHE_CONTROL } from "@/lib/constants";
import { m } from "@/paraglide/messages";
import type { FileRoutesByTo } from "@/routeTree.gen";

export const Route = createFileRoute("/_public")({
  loader: ({ context }) => ({
    preloadImages: getThemePreloadImages(context.siteConfig),
  }),
  component: PublicLayout,
  headers: () => {
    return CACHE_CONTROL.public;
  },
  head: ({ loaderData }) => ({
    links: [
      ...(loaderData?.preloadImages ?? []).map((href) => ({
        rel: "preload" as const,
        as: "image" as const,
        href,
      })),
      {
        rel: "prefetch" as const,
        href: "/posts",
        as: "document" as const,
      },
      {
        rel: "prefetch" as const,
        href: "/search",
        as: "document" as const,
      },
    ],
  }),
});

function flattenVisibleInternalMenuItems(
  items: Array<NavigationMenuItem>,
  isAuthenticated: boolean,
  role: string | null | undefined,
): Array<NavigationMenuItem & { to: string }> {
  return items.flatMap((item) => {
    if (item.visible === false || !hasMenuAccess(item, isAuthenticated, role)) {
      return [];
    }

    const own =
      item.type === "internal" && item.to
        ? ([item] as Array<NavigationMenuItem & { to: string }>)
        : [];

    const childItems = item.children
      ? flattenVisibleInternalMenuItems(item.children, isAuthenticated, role)
      : [];

    return [...own, ...childItems];
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

function PublicLayout() {
  const navigate = useNavigate();
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const queryClient = useQueryClient();

  const defaultNavOptions = [
    { label: m.nav_home(), to: "/" as const, id: "home" },
    { label: m.nav_posts(), to: "/posts" as const, id: "posts" },
    { label: m.nav_lab(), to: "/lab" as const, id: "lab" },
    { label: m.nav_tech_stack(), to: "/tech-stack" as const, id: "tech-stack" },
  ];
  const isAuthenticated = Boolean(session?.user);
  const role = session?.user?.role;
  const navOptionsFromConfig = flattenVisibleInternalMenuItems(
    siteConfig.navigation.main,
    isAuthenticated,
    role,
  ).map((item) => ({
    id: item.id,
    label: resolveBuiltinNavLabel(item),
    to: item.to as keyof FileRoutesByTo,
  }));
  const navOptions =
    navOptionsFromConfig.length > 0 ? navOptionsFromConfig : defaultNavOptions;

  const logout = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(m.auth_logout_failed(), {
        description:
          getLogoutAuthErrorMessage(error, m) ?? m.auth_logout_failed_desc(),
      });
      return;
    }

    queryClient.removeQueries({ queryKey: AUTH_KEYS.session });

    toast.success(m.auth_logout_success(), {
      description: m.auth_logout_success_desc(),
    });
  };

  // Global shortcut: Cmd/Ctrl + K to navigate to search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isToggle = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isToggle) {
        e.preventDefault();
        navigate({ to: "/search" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <>
      <theme.PublicLayout
        navOptions={navOptions}
        user={session?.user}
        isSessionLoading={isSessionPending}
        logout={logout}
      >
        <Outlet />
      </theme.PublicLayout>
      <theme.Toaster />
    </>
  );
}
