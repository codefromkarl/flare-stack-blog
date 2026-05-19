import type { SiteConfig } from "@/features/config/site-config.schema";
import { resolveSocialHref } from "@/features/config/utils/social-platforms";

type ArticleJsonLdInput = {
  authorName: string;
  canonicalHref: string;
  publisherName?: string;
  post: {
    slug: string;
    summary?: string | null;
    title: string;
    publishedAt?: Date | string | null;
    updatedAt: Date | string;
    tags?: Array<{ name: string }> | undefined;
  };
};

export function buildCanonicalHref(
  pathname: string,
  searchParams?: Record<string, string | undefined>,
) {
  const normalizedPath =
    pathname === "/" ? "/" : pathname.replace(/\/+$/, "") || "/";

  if (!searchParams) return normalizedPath;

  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `${normalizedPath}?${query}` : normalizedPath;
}

export function buildCanonicalUrl(
  domain: string,
  pathname: string,
  searchParams?: Record<string, string | undefined>,
) {
  return `https://${domain}${buildCanonicalHref(pathname, searchParams)}`;
}

export function canonicalLink(href: string) {
  return {
    rel: "canonical",
    href,
  } as const;
}

type SocialImageSiteConfig = {
  icons: Partial<SiteConfig["icons"]>;
};

type WebsiteJsonLdInput = {
  domain: string;
  site: Pick<
    SiteConfig,
    "author" | "description" | "social" | "title"
  > & SocialImageSiteConfig;
};

export function buildDefaultSocialImageUrl(
  domain: string,
  site: SocialImageSiteConfig,
) {
  const imagePath =
    site.icons.webApp512 ||
    site.icons.appleTouchIcon ||
    site.icons.favicon96 ||
    site.icons.faviconIco ||
    site.icons.faviconSvg;

  return imagePath ? buildCanonicalUrl(domain, imagePath) : undefined;
}

export function buildWebsiteJsonLd({ domain, site }: WebsiteJsonLdInput) {
  const homepageUrl = buildCanonicalUrl(domain, "/");
  const personId = `${homepageUrl}#person`;
  const websiteId = `${homepageUrl}#website`;
  const imageUrl = buildDefaultSocialImageUrl(domain, site);
  const sameAs = site.social
    .filter((link) => link.url && link.platform !== "email" && link.platform !== "rss")
    .map((link) => resolveSocialHref(link.platform, link.url))
    .map((url) => (url.startsWith("/") ? buildCanonicalUrl(domain, url) : url));

  const website: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": websiteId,
    url: homepageUrl,
    name: site.title,
    description: site.description,
    publisher: {
      "@id": personId,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${buildCanonicalUrl(domain, "/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  if (imageUrl) {
    website.image = imageUrl;
  }

  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": personId,
    name: site.author,
    url: homepageUrl,
    worksFor: {
      "@id": websiteId,
    },
  };

  if (sameAs.length > 0) {
    person.sameAs = sameAs;
  }

  if (imageUrl) {
    person.image = imageUrl;
  }

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [website, person],
  });
}

export function buildArticleJsonLd({
  authorName,
  canonicalHref,
  publisherName,
  post,
}: ArticleJsonLdInput) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    url: canonicalHref,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalHref,
    },
    author: {
      "@type": "Person",
      name: authorName,
    },
    dateModified: new Date(post.updatedAt).toISOString(),
  };

  if (publisherName) {
    jsonLd.publisher = {
      "@type": "Organization",
      name: publisherName,
    };
  }

  if (post.summary) {
    jsonLd.description = post.summary;
  }

  if (post.publishedAt) {
    jsonLd.datePublished = new Date(post.publishedAt).toISOString();
  }

  const keywords = post.tags?.map((tag) => tag.name).filter(Boolean);
  if (keywords?.length) {
    jsonLd.keywords = keywords;
  }

  return JSON.stringify(jsonLd);
}
