import { describe, expect, it } from "vitest";
import {
  renderLlmsTxt,
  renderSitemapXml,
} from "@/features/site-documents/service/site-documents.service";

describe("renderSitemapXml", () => {
  it("includes key public pages for GEO discovery", () => {
    const xml = renderSitemapXml("codefromkarl.xyz", [
      {
        id: 1,
        slug: "contextatlas-harness-engineering",
        createdAt: new Date("2026-04-01T00:00:00.000Z"),
        updatedAt: new Date("2026-04-08T14:11:14.000Z"),
        publishedAt: new Date("2026-04-07T12:00:00.000Z"),
      },
    ]);

    expect(xml).toContain("<loc>https://codefromkarl.xyz/lab</loc>");
    expect(xml).toContain("<loc>https://codefromkarl.xyz/tech-stack</loc>");
    expect(xml).toContain(
      "<loc>https://codefromkarl.xyz/post/contextatlas-harness-engineering</loc>",
    );
  });
});

describe("renderLlmsTxt", () => {
  it("documents the site, important URLs, and crawl guidance", () => {
    const llms = renderLlmsTxt({
      domain: "codefromkarl.xyz",
      site: {
        title: "CodeFromKarl",
        author: "karl",
        description: "分享 AI 工程、Vibe Coding 与全栈实践。",
        social: [
          { platform: "github", url: "https://github.com/du2333" },
          { platform: "rss", url: "/rss.xml" },
        ],
      },
    });

    expect(llms).toContain("# CodeFromKarl");
    expect(llms).toContain("Author: karl");
    expect(llms).toContain("- Posts: https://codefromkarl.xyz/posts");
    expect(llms).toContain("- Lab: https://codefromkarl.xyz/lab");
    expect(llms).toContain("- Tech Stack: https://codefromkarl.xyz/tech-stack");
    expect(llms).toContain("Prefer canonical article URLs under /post/");
  });
});
