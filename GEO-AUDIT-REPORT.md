# GEO Audit Report

审计时间：2026-04-09  
审计对象：`https://codefromkarl.xyz`  
审计方式：仓库源码审查 + 线上抽样抓取（首页、文章页、`robots.txt`、`sitemap.xml`、`rss.xml`、`atom.xml`、`feed.json`、`llms.txt`）

## 结论

当前博客的传统 SEO 基础明显高于一般个人站：SSR 可抓取、canonical 正常、feed/sitemap/robots 都在线、文章页已输出 `Article` JSON-LD。  
但从 GEO 角度看，最核心的问题不是页面代码，而是 **线上 `robots.txt` 目前在主动阻断多个 AI crawler**。这会直接压低 ChatGPT、Claude、Google AI Overviews 等平台的可见性。

**综合 GEO 分数（推断）**：`58/100`

## 评分拆解

| 维度 | 权重 | 评分 | 说明 |
| --- | --- | --- | --- |
| AI 可引用性与可见性 | 25 | 10 | 文章页结构清晰，但 `robots.txt` 阻断多类 AI crawler，且无 `llms.txt` |
| 品牌/实体信号 | 20 | 9 | 有稳定站点名、作者名、GitHub 信号，但缺少更强的实体封装 |
| 内容质量与 E-E-A-T | 20 | 15 | 原创经验型内容不错，摘要、发布时间、更新时间具备 |
| 技术基础 | 15 | 13 | SSR、HTTPS、canonical、feed、sitemap、缓存头都不错 |
| 结构化数据 | 10 | 6 | 文章页有 `Article`，首页/站点级 schema 仍然薄弱 |
| 平台专项优化 | 10 | 5 | 缺少 `llms.txt`、首页 answer block、站点级实体声明 |

## 关键发现

### Critical

1. 线上 `robots.txt` 与仓库实现不一致，且当前实际规则会阻断 AI 可见性
   - 仓库中的预期实现是允许全站抓取，仅屏蔽后台和私有路径，见 [src/features/site-documents/service/site-documents.service.ts](/home/yuanzhi/Develop/ai-research/flare-stack-blog/src/features/site-documents/service/site-documents.service.ts#L142)。
   - 但 2026-04-09 抓取 `https://codefromkarl.xyz/robots.txt` 时，实际返回的是 Cloudflare Managed content，并明确列出了 `ClaudeBot`、`GPTBot`、`Google-Extended`、`CCBot`、`Amazonbot`、`Bytespider`、`meta-externalagent` 等规则。
   - 这意味着传统搜索仍可能正常，但 AI 摘要、AI 引用、模型检索曝光会显著受损。

2. `llms.txt` 不存在
   - `https://codefromkarl.xyz/llms.txt` 当前返回 `404`。
   - 对个人博客来说，`llms.txt` 不是必须项，但对 GEO 很有价值，尤其适合把“作者是谁、站点写什么、推荐抓哪些页面、引用时优先哪些栏目”明确告诉模型。

### High

3. 首页只有基础 title/description/canonical，缺少首页级社交卡片和站点级 schema
   - 根路由只注入基础 `title`、`description` 与 feed 链接，见 [src/routes/__root.tsx](/home/yuanzhi/Develop/ai-research/flare-stack-blog/src/routes/__root.tsx#L35)。
   - 线上首页 head 已验证有 canonical，但未见首页级 `og:title`、`og:description`、`og:image`、`twitter:card`、`WebSite`/`Organization`/`Person` schema。
   - 结果是首页作为“实体介绍页”不够强，不利于被模型当作稳定引用源。

4. sitemap 覆盖不完整，漏掉了部分公开的实体型页面
   - 当前 sitemap 只包含 `/`、`/posts`、`/friend-links` 和文章详情页，见 [src/features/site-documents/service/site-documents.service.ts](/home/yuanzhi/Develop/ai-research/flare-stack-blog/src/features/site-documents/service/site-documents.service.ts#L94)。
   - 但站点公开导航里还存在 `/lab`、`/tech-stack`，见 [src/blog.config.ts](/home/yuanzhi/Develop/ai-research/flare-stack-blog/src/blog.config.ts#L31)。
   - 对 GEO 来说，这些页面往往正是“作者画像”“方法论”“技术能力”的关键信号页，应该进入 sitemap。

5. 结构化数据只覆盖文章详情页，缺少站点级与作者级 schema
   - 当前只实现了 `Article` JSON-LD，见 [src/lib/seo.ts](/home/yuanzhi/Develop/ai-research/flare-stack-blog/src/lib/seo.ts#L50) 和 [src/routes/_public/post/$slug.tsx](/home/yuanzhi/Develop/ai-research/flare-stack-blog/src/routes/_public/post/$slug.tsx#L49)。
   - 缺少的高价值 schema 包括：`WebSite`、`Person`、`BreadcrumbList`、`CollectionPage`、可选的 `SearchAction`。

### Medium

6. 文章页缺少更完整的社交/引用元信息
   - 当前文章页有 `og:title`、`og:description`、`og:type`、`og:url`，但未见 `og:image`、`twitter:card`、`article:published_time`、`article:modified_time`，见 [src/routes/_public/post/$slug.tsx](/home/yuanzhi/Develop/ai-research/flare-stack-blog/src/routes/_public/post/$slug.tsx#L53)。
   - 这不会阻止抓取，但会削弱分享卡片质量与二次分发效果。

7. Feed 很强，但作者邮箱被公开暴露
   - `rss.xml`、`atom.xml`、`feed.json` 都正常在线，这一点对抓取和再分发非常友好。
   - 不过 feed 生成逻辑会写入 `ADMIN_EMAIL`，见 [src/features/posts/utils/feed.ts](/home/yuanzhi/Develop/ai-research/flare-stack-blog/src/features/posts/utils/feed.ts#L35)。
   - 如果这是有意公开则没问题；如果不是，建议切为公开作者页链接而非邮箱。

## 亮点

- 站点是 SSR 输出，HTML 对搜索引擎和抓取器友好。
- 首页和文章页 canonical 正常。
- 文章页已输出 `Article` JSON-LD，且包含 `headline`、`description`、`author`、`datePublished`、`dateModified`、`keywords`。
- `rss.xml`、`atom.xml`、`feed.json`、`sitemap.xml` 都在线。
- sitemap 中的文章带 `lastmod`，这是好信号。

## 平台视角

### Google Search

传统 SEO 基础不错，索引能力不差。

### Google AI Overviews

受 `Google-Extended` 阻断影响，表现会明显弱于传统搜索。

### ChatGPT / GPT 生态

受 `GPTBot` 阻断、`llms.txt` 缺失影响，主动发现和稳定引用能力偏弱。

### Claude

受 `ClaudeBot` 阻断影响，GEO 表现偏弱。

### Perplexity

没有看到明确的 Perplexity 定向规则，但由于首页实体封装弱、无 `llms.txt`，可见性仍不算强。

## 优先级建议

### P0

1. 修正线上 `robots.txt` 来源，确保真实返回内容与你的应用实现一致。
2. 明确 AI 抓取策略：如果目标是做 GEO，不要继续阻断 `ClaudeBot`、`GPTBot`、`Google-Extended`。
3. 新增 `llms.txt`。

### P1

1. 给首页增加 `og:*`、`twitter:*`、`WebSite` + `Person` JSON-LD。
2. 给文章页补 `og:image`、`twitter:card`、`article:published_time`、`article:modified_time`。
3. 扩展 sitemap，把 `/lab`、`/tech-stack`、`/about` 这类公开权威页纳入。

### P2

1. 增加 `BreadcrumbList` schema。
2. 增加作者介绍页或首页作者模块的实体化描述。
3. 把“你是谁、擅长什么、代表文章、开源项目、外部身份链接”做成可直接引用的 answer block。

## 最短改进路径

如果只做 3 件事，优先顺序应该是：

1. 修线上 `robots.txt`
2. 补 `llms.txt`
3. 给首页补站点级 schema 和社交卡片

做完这三项，GEO 分数大概率能从 `58` 提升到 `70+`。
