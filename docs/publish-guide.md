# Publish Guide: Docs → Blog Posts

## Background

The blog stores articles in D1 (Cloudflare's SQLite-compatible database) as TipTap JSON content. The admin UI uses a rich text editor to create/edit posts, but this requires GitHub OAuth login and manual interaction.

For team members/agents who have `wrangler` CLI access, there is a faster path: **direct D1 insertion**.

## Quick Start

```bash
# From project root
bun run scripts/publish-doc.ts

# Or publish a specific doc
DOC_PATH=docs/my-article.md bun run scripts/publish-doc.ts
```

## How It Works

```
docs/xxx.md
    │
    ▼
markdownToJsonContent()        ← built-in (src/features/import-export/utils/)
    │  uses: marked → linkedom → ProseMirror DOMParser
    ▼
TipTap JSON
    │
    ▼
highlightCodeBlocks()          ← built-in (src/features/posts/utils/content.ts)
    │  uses: shiki for syntax highlighting
    ▼
Highlighted JSON
    │
    ▼
wrangler d1 execute --remote   ← inserts into production D1
    │
    ▼
Published on blog
```

## What the Script Does

1. **Reads markdown** from `docs/` (title extracted from `# Heading`)
2. **Converts to TipTap JSON** via the blog's own parser (supports headings, bold, lists, code blocks, tables, images, blockquotes, links, math)
3. **Highlights code blocks** using shiki (language-aware syntax coloring)
4. **Checks slug uniqueness** — skips if already exists
5. **Inserts into D1** as `published` status with current timestamp

## Prerequisites

- `wrangler` CLI installed and authenticated (`wrangler whoami`)
- Write access to `blog-db` D1 database
- Dependencies installed (`bun install`)

## vs Admin UI

| Approach | Auth Required | Steps | Best For |
|----------|--------------|-------|----------|
| CLI (`scripts/publish-doc.ts`) | Wrangler credentials | 1 | Bulk, automated, agent-driven |
| Admin UI (`/admin/posts`) | GitHub OAuth | 5+ | Manual editing, rich text tweaks |

## Script Reference

```bash
# Environment variables
DOC_PATH      # Path to markdown file (default: docs/预设文章.md)
```

Output:
- Blog post URL: `https://codefromkarl.xyz/post/<slug>`
- Edit URL (via admin): `https://codefromkarl.xyz/admin/posts`

## Notes

- The script does NOT set tags — posts appear without tag associations
- To add tags, edit via admin UI after publishing
- Slug is auto-generated from the Chinese title via transliteration
- Posts are immediately published; set status to `draft` manually if needed
- The SQL file is left at `/tmp/publish-post.sql` for inspection
- **CDN Cache**: After publishing, the article is live at the direct URL immediately, but the homepage and `/posts` listing page may be cached by Cloudflare CDN. To refresh the listing, either wait for cache TTL expiry or trigger a new deployment (see below)

## Refreshing Listing Pages After Publish

The blog uses multi-layer caching: **CDN Edge → KV Store → D1**.

Publishing via CLI inserts into D1 and bumps the KV cache version, but the CDN edge may still serve stale HTML for listing pages (`/` and `/posts`).

### Option 1: Trigger a Deployment (Fastest)

Push any commit to the `main` branch. The CI/CD pipeline will deploy and automatically purge CDN cache:

```bash
git commit --allow-empty -m "chore: trigger deploy to refresh CDN cache"
git push origin main
```

### Option 2: Wait for Cache Expiry

Cloudflare Pages' default HTML cache TTL is typically a few minutes to hours. The listing pages will automatically show the new article when the cache expires.

### Option 3: Direct Link

The article is immediately accessible at its direct URL regardless of CDN cache state:
```
https://codefromkarl.xyz/post/<slug>
```
