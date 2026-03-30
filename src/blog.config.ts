import type { SiteConfig } from "@/features/config/site-config.schema";

export const blogConfig = {
  title: "CodeFromKarl",
  author: "Karl",
  description:
    "Karl 的个人博客，分享技术与生活。欢迎阅读！",
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
