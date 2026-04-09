import * as ConfigService from "@/features/config/service/config.service";
import {
  getPublishedPostsForSitemapBatch,
  type SitemapPostRow,
} from "@/features/posts/data/posts.data";
import { buildFeed } from "@/features/posts/utils/feed";
import { getDb } from "@/lib/db";

export const SITE_DOCUMENT_CACHE_CONTROL = {
  feed: "public, max-age=3600, s-maxage=3600",
  llms: "public, max-age=3600, s-maxage=3600",
  manifest: "public, max-age=3600, s-maxage=3600",
  robots: "public, max-age=86400, s-maxage=86400",
  sitemap: "public, max-age=3600, s-maxage=3600",
} as const;

const STATIC_SITEMAP_ENTRIES = [
  {
    path: "/",
    changefreq: "daily",
    priority: "1.0",
  },
  {
    path: "/posts",
    changefreq: "weekly",
    priority: "0.8",
  },
  {
    path: "/lab",
    changefreq: "weekly",
    priority: "0.8",
  },
  {
    path: "/tech-stack",
    changefreq: "weekly",
    priority: "0.8",
  },
  {
    path: "/friend-links",
    changefreq: "weekly",
    priority: "0.7",
  },
] as const;

function buildManifest(
  site: Awaited<ReturnType<typeof ConfigService.getSiteConfig>>,
) {
  return {
    name: site.title,
    short_name: site.title,
    icons: [
      {
        src: site.icons.webApp192,
        sizes: "192x192",
      },
      {
        src: site.icons.webApp512,
        sizes: "512x512",
      },
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  };
}

export async function buildFeedJson(env: Env, executionCtx: ExecutionContext) {
  const feed = await buildFeed(env, executionCtx);
  return feed.json1();
}

export async function buildRssXml(env: Env, executionCtx: ExecutionContext) {
  const feed = await buildFeed(env, executionCtx);
  return feed.rss2();
}

export async function buildAtomXml(env: Env, executionCtx: ExecutionContext) {
  const feed = await buildFeed(env, executionCtx);
  return feed.atom1();
}

const SITEMAP_BATCH_SIZE = 500;

async function getAllPublishedPostsForSitemap(env: Env) {
  const db = getDb(env);
  const posts: Array<SitemapPostRow> = [];

  let cursor: {
    publishedAt: Date;
    id: number;
  } | null = null;

  while (true) {
    const batch = await getPublishedPostsForSitemapBatch(db, {
      cursor: cursor ?? undefined,
      limit: SITEMAP_BATCH_SIZE,
    });

    if (batch.length === 0) {
      break;
    }

    posts.push(...batch);

    const lastPost = batch[batch.length - 1];
    if (!lastPost?.publishedAt) {
      break;
    }

    cursor = {
      publishedAt: lastPost.publishedAt,
      id: lastPost.id,
    };

    if (batch.length < SITEMAP_BATCH_SIZE) {
      break;
    }
  }

  return posts;
}

export function renderSitemapXml(domain: string, posts: Array<SitemapPostRow>) {
  const formatDate = (
    primaryDate: Date | null,
    fallbacks: Array<Date | null> = [],
  ) => {
    const date = [primaryDate, ...fallbacks].find((value) => value != null);
    if (!date) return null;
    return new Date(date).toISOString();
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${STATIC_SITEMAP_ENTRIES.map(
    (entry) => `
  <url>
    <loc>https://${domain}${entry.path}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  ).join("")}
  ${posts
    .map((post) => {
      const lastModifiedAt = formatDate(post.updatedAt, [
        post.publishedAt,
        post.createdAt,
      ]);

      return `
  <url>
    <loc>https://${domain}/post/${encodeURIComponent(post.slug)}</loc>
    ${lastModifiedAt ? `<lastmod>${lastModifiedAt}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join("")}
</urlset>`;
}

export async function buildSitemapXml(env: Env) {
  const posts = await getAllPublishedPostsForSitemap(env);
  return renderSitemapXml(env.DOMAIN, posts);
}

export function buildRobotsTxt(env: Env) {
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /search
Disallow: /unsubscribe
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /verify-email
Disallow: /reset-link
Disallow: /oauth/consent
Disallow: /profile
Disallow: /submit-friend-link
Sitemap: https://${env.DOMAIN}/sitemap.xml`;
}

type LlmsSiteInfo = {
  author: string;
  description: string;
  social: Array<{ platform: string; url: string }>;
  title: string;
};

export function renderLlmsTxt({
  domain,
  site,
}: {
  domain: string;
  site: LlmsSiteInfo;
}) {
  const socialLinks = site.social
    .filter((item) => item.url)
    .map((item) => `- ${item.platform}: ${item.url}`);

  const lines = [
    `# ${site.title}`,
    "",
    `> ${site.description}`,
    "",
    "## Site",
    `- URL: https://${domain}/`,
    `- Author: ${site.author}`,
    `- Description: ${site.description}`,
    "",
    "## Important Pages",
    `- Home: https://${domain}/`,
    `- Posts: https://${domain}/posts`,
    `- Lab: https://${domain}/lab`,
    `- Tech Stack: https://${domain}/tech-stack`,
    `- Friend Links: https://${domain}/friend-links`,
    `- Sitemap: https://${domain}/sitemap.xml`,
    `- RSS: https://${domain}/rss.xml`,
    `- Atom: https://${domain}/atom.xml`,
    `- JSON Feed: https://${domain}/feed.json`,
    "",
    "## Crawl Guidance",
    `- Prefer canonical article URLs under /post/ on https://${domain}.`,
    "- Use page titles, summaries, publish dates, update dates, and tags when citing.",
    "- Ignore admin, auth, profile, and unsubscribe routes.",
  ];

  if (socialLinks.length > 0) {
    lines.push("", "## Social Profiles", ...socialLinks);
  }

  return `${lines.join("\n")}\n`;
}

export async function buildLlmsTxt(
  env: Env,
  executionCtx: ExecutionContext,
) {
  const site = await ConfigService.getSiteConfig({
    env,
    db: getDb(env),
    executionCtx,
  });

  return renderLlmsTxt({
    domain: env.DOMAIN,
    site: {
      title: site.title,
      author: site.author,
      description: site.description,
      social: site.social.map((item) => ({
        platform: item.platform,
        url: item.url,
      })),
    },
  });
}

export async function buildWebManifest(
  env: Env,
  executionCtx: ExecutionContext,
) {
  const site = await ConfigService.getSiteConfig({
    env,
    db: getDb(env),
    executionCtx,
  });

  return JSON.stringify(buildManifest(site), null, 2);
}
