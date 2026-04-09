import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import theme from "@theme";
import { ThemeProvider } from "@/components/common/theme-provider";
import { siteConfigQuery, siteDomainQuery } from "@/features/config/queries";
import { useWebVitals } from "@/hooks/use-web-vitals";
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools";
import { clientEnv } from "@/lib/env/client.env";
import {
  buildDefaultSocialImageUrl,
  buildWebsiteJsonLd,
} from "@/lib/seo";
import { getLocale } from "@/paraglide/runtime";
import appCss from "@/styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ context }) => {
    const [siteConfig, domain] = await Promise.all([
      context.queryClient.ensureQueryData(siteConfigQuery),
      context.queryClient.ensureQueryData(siteDomainQuery),
    ]);
    return { siteConfig, domain };
  },
  loader: async ({ context }) => {
    return { siteConfig: context.siteConfig, domain: context.domain };
  },
  head: ({ loaderData }) => {
    const env = clientEnv();
    const siteConfig = loaderData?.siteConfig;
    const domain = loaderData?.domain;
    const defaultSocialImage =
      siteConfig && domain
        ? buildDefaultSocialImageUrl(domain, siteConfig)
        : undefined;
    const scripts = [];

    if (siteConfig && domain) {
      scripts.push({
        type: "application/ld+json",
        children: buildWebsiteJsonLd({
          domain,
          site: siteConfig,
        }),
      });
    }

    if (env.VITE_UMAMI_WEBSITE_ID) {
      scripts.push({
        src: "/stats.js",
        defer: true,
        "data-website-id": env.VITE_UMAMI_WEBSITE_ID,
      });
    }

    return {
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: loaderData?.siteConfig?.title,
        },
        {
          name: "description",
          content: loaderData?.siteConfig?.description,
        },
        {
          property: "og:site_name",
          content: loaderData?.siteConfig?.title ?? "",
        },
        ...(defaultSocialImage
          ? [
              {
                property: "og:image",
                content: defaultSocialImage,
              },
              {
                name: "twitter:card",
                content: "summary",
              },
              {
                name: "twitter:image",
                content: defaultSocialImage,
              },
            ]
          : []),
      ],
      links: [
        {
          rel: "dns-prefetch",
          href: "//fonts.googleapis.com",
        },
        {
          rel: "dns-prefetch",
          href: "//fonts.gstatic.com",
        },
        {
          rel: "preconnect",
          href: "//fonts.googleapis.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "preconnect",
          href: "//fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "icon",
          type: "image/svg+xml",
          href: loaderData?.siteConfig?.icons.faviconSvg,
        },
        {
          rel: "icon",
          type: "image/png",
          href: loaderData?.siteConfig?.icons.favicon96,
          sizes: "96x96",
        },
        {
          rel: "shortcut icon",
          href: loaderData?.siteConfig?.icons.faviconIco,
        },
        {
          rel: "apple-touch-icon",
          type: "image/png",
          href: loaderData?.siteConfig?.icons.appleTouchIcon,
          sizes: "180x180",
        },
        {
          rel: "manifest",
          href: "/site.webmanifest",
        },
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "RSS Feed",
          href: "/rss.xml",
        },
        {
          rel: "alternate",
          type: "application/atom+xml",
          title: "Atom Feed",
          href: "/atom.xml",
        },
        {
          rel: "alternate",
          type: "application/feed+json",
          title: "JSON Feed",
          href: "/feed.json",
        },
      ],
      scripts,
    };
  },
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const { siteConfig } = useRouteContext({ from: "__root__" });
  useWebVitals();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      style={theme.getDocumentStyle?.(siteConfig)}
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  );
}
