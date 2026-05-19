/**
 * 将 docs/ 中的 Markdown 文档发布为博客文章
 *
 * 用法:
 *   bun run scripts/publish-doc.ts                     # 发布预设文章
 *   DOC_PATH=docs/xxx.md bun run scripts/publish-doc.ts # 发布指定文章
 *
 * 原理:
 *   1. 用博客自带的 markdownToJsonContent() 将 MD 转为 TipTap JSON
 *   2. 用 highlightCodeBlocks() 高亮代码块
 *   3. 通过 wrangler d1 execute --remote 直接插入生产 D1 数据库
 *   4. 状态设为 published，无需经过后台 UI
 *
 * 前置条件:
 *   - wrangler CLI 已登录且有 blog-db 的写入权限
 *   - 项目依赖已安装 (bun install)
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const CWD = process.cwd();
const DOC_PATH =
  process.env.DOC_PATH ||
  `${CWD}/docs/如何一天之内开发并且上线一个旅游智能体.md`;
const DB = "blog-db";
const DOMAIN = "codefromkarl.xyz";

// ---------- 从 Markdown 提取标题 ----------
function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)/m);
  return match?.[1]?.trim() ?? "Untitled";
}

// ---------- 分离正文（去掉 # 标题行和引用行） ----------
function extractBody(markdown: string): string {
  return markdown
    .split("\n")
    .filter((l) => !l.startsWith("# ") && !l.startsWith("> **"))
    .join("\n")
    .trim();
}

// ---------- 生成英文 slug ----------
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^(.{60}).*$/, "$1");
}

// ---------- 检查 slug 是否已存在 ----------
function checkSlugExists(slug: string): boolean {
  try {
    const out = execSync(
      `wrangler d1 execute ${DB} --remote --json --command "SELECT id FROM posts WHERE slug='${slug}'"`,
      { encoding: "utf-8", cwd: CWD },
    );
    const rows = JSON.parse(out);
    return rows?.[0]?.results?.length > 0;
  } catch {
    return false;
  }
}

// ---------- SQL 转义 ----------
const esc = (s: string) => s.replace(/'/g, "''");

// ---------- 主流程 ----------
async function main() {
  console.error(`📄 读取: ${DOC_PATH}`);
  const markdown = readFileSync(DOC_PATH, "utf-8");
  const title = extractTitle(markdown);
  const body = extractBody(markdown);
  const slug = generateSlug(title);

  console.error(`📝 标题: ${title}`);
  console.error(`🔗 Slug: ${slug}`);

  // 1. 转换 Markdown → TipTap JSON
  console.error("🔄 转换 Markdown → TipTap JSON...");
  const { markdownToJsonContent } = await import(
    `${CWD}/src/features/import-export/utils/markdown-parser.ts`
  );
  const contentJson = await markdownToJsonContent(body);

  // 2. 代码高亮
  console.error("🎨 高亮代码块...");
  const { highlightCodeBlocks } = await import(
    `${CWD}/src/features/posts/utils/content.ts`
  );
  const highlighted = await highlightCodeBlocks(contentJson);
  const jsonStr = JSON.stringify(highlighted);

  // 3. 检查 slug 冲突
  console.error("🔍 检查 slug 冲突...");
  if (checkSlugExists(slug)) {
    console.error(`❌ Slug "${slug}" 已存在，跳过发布`);
    process.exit(1);
  }

  // 4. 生成 SQL
  const now = Math.floor(Date.now() / 1000);
  const summary = extractSummary(markdown) || `${title} — 技术分享`;
  const readTime = Math.max(1, Math.round(body.length / 500));

  const sql = `INSERT INTO posts (title, summary, slug, content_json, status, published_at, created_at, updated_at, read_time_in_minutes)
VALUES (
  '${esc(title)}',
  '${esc(summary)}',
  '${esc(slug)}',
  '${esc(jsonStr)}',
  'published',
  ${now},
  ${now},
  ${now},
  ${readTime}
);`;

  const sqlFile = "/tmp/publish-post.sql";
  writeFileSync(sqlFile, sql, "utf-8");
  console.error(`💾 SQL 暂存: ${sqlFile}`);

  // 5. 执行插入
  console.error(`🚀 执行 wrangler d1 execute ${DB} --remote...`);
  execSync(`wrangler d1 execute ${DB} --remote --file=${sqlFile}`, {
    stdio: "inherit",
    cwd: CWD,
  });

  // 6. 刷新 KV 缓存版本号（否则列表页不会显示新文章）
  console.error("🔄 刷新 KV 缓存版本号...");
  const KV_ID = "54cbe2585dca45299274e595426b8ff8";
  try {
    for (const key of ["ver:posts:list", "ver:posts:detail"]) {
      const getCmd = `wrangler kv key get ${KV_ID} "${key}"`;
      const currentStr = execSync(getCmd, {
        encoding: "utf-8",
        cwd: CWD,
      }).trim();
      const current = currentStr ? Number.parseInt(currentStr) || 1 : 1;
      const next = current + 1;
      execSync(`wrangler kv key put ${KV_ID} "${key}" ${next}`, {
        stdio: "inherit",
        cwd: CWD,
      });
      console.error(`   ${key}: ${current} → ${next}`);
    }
    console.error("   缓存版本已刷新，列表页将在下次请求时显示新文章");
  } catch (e) {
    console.error(`⚠️  KV 刷新失败（不影响文章已在 DB 中）: ${e}`);
    console.error(`   直接访问: https://${DOMAIN}/post/${slug}`);
  }

  console.error(`\n✅ 发布成功！`);
  console.error(`   标题: ${title}`);
  console.error(`   链接: https://${DOMAIN}/post/${slug}`);
  console.error(`   编辑: https://${DOMAIN}/admin/posts\n`);
}

// ---------- 尝试从 frontmatter 或首段提取摘要 ----------
function extractSummary(markdown: string): string | null {
  // 尝试 frontmatter
  const fmMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const summaryMatch = fmMatch[1].match(/^summary:\s*(.+)/m);
    if (summaryMatch) return summaryMatch[1].trim();
  }
  // 尝试第二段非空行
  const paras = markdown
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 20 && !p.startsWith("#") && !p.startsWith(">"));
  return paras[0]?.slice(0, 200) ?? null;
}

main().catch((e) => {
  console.error("❌ 失败:", e);
  process.exit(1);
});
