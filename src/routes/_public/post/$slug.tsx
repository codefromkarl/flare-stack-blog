import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import theme from "@theme";
import { useEffect } from "react";
import { z } from "zod";
import { siteConfigQuery, siteDomainQuery } from "@/features/config/queries";
import { recordPageViewFn } from "@/features/pageview/api/pageview.api";
import { postBySlugQuery, relatedPostsQuery } from "@/features/posts/queries";
import {
  buildArticleJsonLd,
  buildCanonicalUrl,
  buildDefaultSocialImageUrl,
  canonicalLink,
} from "@/lib/seo";

const searchSchema = z.object({
  highlightCommentId: z.coerce.number().optional(),
  rootId: z.number().optional(),
});

const { relatedPostsLimit } = theme.config.post;

export const Route = createFileRoute("/_public/post/$slug")({
  validateSearch: searchSchema,
  component: RouteComponent,
  loader: async ({ context, params }) => {
    // 1. Critical: Main post data - use serverFn (executes directly on server, no HTTP)
    const [post, domain, siteConfig] = await Promise.all([
      context.queryClient.ensureQueryData(postBySlugQuery(params.slug)),
      context.queryClient.ensureQueryData(siteDomainQuery),
      context.queryClient.ensureQueryData(siteConfigQuery),
    ]);

    // 2. Deferred: Related posts (prefetch only, don't await)
    void context.queryClient.prefetchQuery(
      relatedPostsQuery(params.slug, relatedPostsLimit),
    );

    if (!post) throw notFound();

    return {
      post,
      authorName: siteConfig.author,
      publisherName: siteConfig.title,
      canonicalHref: buildCanonicalUrl(
        domain,
        `/post/${encodeURIComponent(post.slug)}`,
      ),
      socialImageUrl: buildDefaultSocialImageUrl(domain, siteConfig),
    };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    const canonicalHref = loaderData?.canonicalHref ?? "";

    return {
      meta: [
        {
          title: post?.title,
        },
        {
          name: "description",
          content: post?.summary ?? "",
        },
        { property: "og:title", content: post?.title ?? "" },
        { property: "og:description", content: post?.summary ?? "" },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonicalHref },
        {
          property: "og:site_name",
          content: loaderData?.publisherName ?? "",
        },
        ...(post?.publishedAt
          ? [
              {
                property: "article:published_time",
                content: new Date(post.publishedAt).toISOString(),
              },
            ]
          : []),
        ...(post?.updatedAt
          ? [
              {
                property: "article:modified_time",
                content: new Date(post.updatedAt).toISOString(),
              },
            ]
          : []),
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
                content: post?.title ?? "",
              },
              {
                name: "twitter:description",
                content: post?.summary ?? "",
              },
              {
                name: "twitter:image",
                content: loaderData.socialImageUrl,
              },
            ]
          : []),
      ],
      links: [canonicalLink(canonicalHref)],
      scripts: post
        ? [
            {
              type: "application/ld+json",
              children: buildArticleJsonLd({
                authorName: loaderData.authorName,
                canonicalHref,
                publisherName: loaderData.publisherName,
                post,
              }),
            },
          ]
        : [],
    };
  },
  pendingComponent: () => <theme.PostPageSkeleton />,
  pendingMs: __THEME_CONFIG__.pendingMs,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postBySlugQuery(slug));

  useEffect(() => {
    if (!post?.id) return;
    try {
      const key = `pv:${post.id}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Safari private mode / storage disabled — record anyway
    }
    void recordPageViewFn({ data: { postId: post.id } });
  }, [post?.id]);

  if (!post) throw notFound();

  return <theme.PostPage post={post} />;
}
