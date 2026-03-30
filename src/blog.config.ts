import type { SiteConfig } from "@/features/config/site-config.schema";

export const blogConfig = {
  title: "CodeFromKarl",
  author: "Karl",
  description:
    "Karl \u7684\u4e2a\u4eba\u535a\u5ba2\uff0c\u5206\u4eab\u6280\u672f\u4e0e\u751f\u6d3b\u3002\u6b22\u8fce\u9605\u8bfb\uff01",
  social: [
    { platform: "github", url: "https://github.com/codefromkarl" },
    { platform: "email", url: "mailto:1069123094@qq.com" },
    { platform: "rss", url: "/rss.xml" },
  ],
  icons: {
    faviconSvg: "/favicon.svg",
    faviconIco: "/favicon.ico",
    favicon96: "/favicon-96x96.png",
    appleTouchIcon: "/apple-touch-icon.png",
    webApp192: "/web-app-manifest-192x192.png",
    webApp512: "/web-app-manifest-512x512.png",
  },
  theme: {
    default: {
      navBarName: "CodeFromKarl",
    },
    fuwari: {
      homeBg: "/images/home-bg.webp",
      avatar: "/images/avatar.png",
      primaryHue: 250,
    },
  },
} as const satisfies SiteConfig;
