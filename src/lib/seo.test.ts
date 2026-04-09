import { describe, expect, it } from "vitest";
import {
  buildArticleJsonLd,
  buildDefaultSocialImageUrl,
  buildWebsiteJsonLd,
} from "@/lib/seo";

describe("buildDefaultSocialImageUrl", () => {
  it("uses an absolute site image URL", () => {
    expect(
      buildDefaultSocialImageUrl("codefromkarl.xyz", {
        icons: {
          webApp512: "/web-app-manifest-512x512.png",
        },
      }),
    ).toBe("https://codefromkarl.xyz/web-app-manifest-512x512.png");
  });
});

describe("buildWebsiteJsonLd", () => {
  it("includes WebSite and Person entities with social links", () => {
    const payload = JSON.parse(
      buildWebsiteJsonLd({
        domain: "codefromkarl.xyz",
        site: {
          title: "CodeFromKarl",
          author: "karl",
          description: "分享 AI 工程、Vibe Coding 与全栈实践。",
          social: [
            { platform: "github", url: "https://github.com/du2333" },
            { platform: "twitter", url: "https://x.com/codefromkarl" },
            { platform: "email", url: "mailto:hello@example.com" },
          ],
          icons: {
            webApp512: "/web-app-manifest-512x512.png",
          },
        },
      }),
    );

    expect(payload["@graph"]).toHaveLength(2);
    expect(payload["@graph"][0]["@type"]).toBe("WebSite");
    expect(payload["@graph"][1]["@type"]).toBe("Person");
    expect(payload["@graph"][1].sameAs).toEqual([
      "https://github.com/du2333",
      "https://x.com/codefromkarl",
    ]);
  });
});

describe("buildArticleJsonLd", () => {
  it("adds publisher and keywords for article GEO context", () => {
    const payload = JSON.parse(
      buildArticleJsonLd({
        authorName: "karl",
        canonicalHref: "https://codefromkarl.xyz/post/contextatlas",
        publisherName: "CodeFromKarl",
        post: {
          slug: "contextatlas",
          title: "ContextAtlas",
          summary: "上下文工程实践",
          publishedAt: "2026-04-07T12:00:00.000Z",
          updatedAt: "2026-04-08T14:11:14.000Z",
          tags: [{ name: "AI Engineering" }, { name: "Context Engineering" }],
        },
      }),
    );

    expect(payload.publisher).toEqual({
      "@type": "Organization",
      name: "CodeFromKarl",
    });
    expect(payload.keywords).toEqual([
      "AI Engineering",
      "Context Engineering",
    ]);
  });
});
