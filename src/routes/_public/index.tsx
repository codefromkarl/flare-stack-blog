import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import theme from "@theme";
import { siteConfigQuery, siteDomainQuery } from "@/features/config/queries";
import {
  pinnedPostsQuery,
  popularPostsQuery,
  recentPostsQuery,
} from "@/features/posts/queries";
import {
  buildCanonicalUrl,
  buildDefaultSocialImageUrl,
  canonicalLink,
} from "@/lib/seo";

const { recentPostsLimit, popularPostsLimit } = theme.config.home;

export const Route = createFileRoute("/_public/")({
  loader: async ({ context }) => {
    const [, domain, siteConfig] = await Promise.all([
      context.queryClient.ensureQueryData(recentPostsQuery(recentPostsLimit)),
      context.queryClient.ensureQueryData(siteDomainQuery),
      context.queryClient.ensureQueryData(siteConfigQuery),
      context.queryClient.ensureQueryData(pinnedPostsQuery),
      context.queryClient.ensureQueryData(popularPostsQuery(popularPostsLimit)),
    ]);

    return {
      siteTitle: siteConfig.title,
      description: siteConfig.description,
      canonicalHref: buildCanonicalUrl(domain, "/"),
      socialImageUrl: buildDefaultSocialImageUrl(domain, siteConfig),
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.siteTitle,
      },
      {
        name: "description",
        content: loaderData?.description,
      },
      { property: "og:title", content: loaderData?.siteTitle ?? "" },
      { property: "og:description", content: loaderData?.description ?? "" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: loaderData?.canonicalHref ?? "" },
      ...(loaderData?.socialImageUrl
        ? [
            {
              property: "og:image",
              content: loaderData.socialImageUrl,
            },
            {
              name: "twitter:card",
              content: "summary",
            },
            {
              name: "twitter:title",
              content: loaderData?.siteTitle ?? "",
            },
            {
              name: "twitter:description",
              content: loaderData?.description ?? "",
            },
            {
              name: "twitter:image",
              content: loaderData.socialImageUrl,
            },
          ]
        : []),
    ],
    links: [canonicalLink(loaderData?.canonicalHref ?? "/")],
  }),
  pendingComponent: HomePageSkeleton,
  component: HomeRoute,
});

function HomeRoute() {
  const { data: posts } = useSuspenseQuery(recentPostsQuery(recentPostsLimit));
  const { data: pinnedPosts } = useSuspenseQuery(pinnedPostsQuery);
  const { data: popularPosts } = useSuspenseQuery(
    popularPostsQuery(popularPostsLimit),
  );

  return (
    <theme.HomePage
      posts={posts}
      pinnedPosts={pinnedPosts}
      popularPosts={popularPosts}
    />
  );
}

function HomePageSkeleton() {
  return <theme.HomePageSkeleton />;
}
