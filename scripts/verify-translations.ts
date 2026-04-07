import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The localization messages are located in 'messages' directory
const messagesDir = path.resolve(__dirname, "../messages");
const zhPath = path.join(messagesDir, "zh.json");
const enPath = path.join(messagesDir, "en.json");

try {
  const zhContent = JSON.parse(fs.readFileSync(zhPath, "utf8"));
  const enContent = JSON.parse(fs.readFileSync(enPath, "utf8"));

  const zhKeys = Object.keys(zhContent).filter((k) => k !== "$schema");
  const enKeys = Object.keys(enContent).filter((k) => k !== "$schema");

  const missingInEn = zhKeys.filter((key) => !(key in enContent));
  const missingInZh = enKeys.filter((key) => !(key in zhContent));

  const placeholderMismatches: Array<string> = [];
  const sameTextWarnings: Array<string> = [];

  const extractPlaceholders = (text: string) => {
    const result = new Set<string>();
    const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    let match = regex.exec(text);
    while (match) {
      result.add(match[1]);
      match = regex.exec(text);
    }
    return result;
  };

  const keysInBoth = zhKeys.filter((key) => key in enContent);
  for (const key of keysInBoth) {
    const zhValue = zhContent[key];
    const enValue = enContent[key];

    if (typeof zhValue === "string" && typeof enValue === "string") {
      const zhPlaceholders = extractPlaceholders(zhValue);
      const enPlaceholders = extractPlaceholders(enValue);

      const zhSet = [...zhPlaceholders].sort().join(",");
      const enSet = [...enPlaceholders].sort().join(",");

      if (zhSet !== enSet) {
        placeholderMismatches.push(key);
      }

      const zhNormalized = zhValue.trim().toLowerCase();
      const enNormalized = enValue.trim().toLowerCase();
      if (zhNormalized === enNormalized && zhNormalized.length > 0) {
        sameTextWarnings.push(key);
      }
    }
  }

  let hasError = false;
  if (missingInEn.length > 0) {
    hasError = true;
    console.error(`❌ en.json 缺少 ${missingInEn.length} 个 key:`);
    missingInEn.forEach((key) => console.error(`  - ${key}`));
  }
  if (missingInZh.length > 0) {
    hasError = true;
    console.error(`❌ zh.json 缺少 ${missingInZh.length} 个 key:`);
    missingInZh.forEach((key) => console.error(`  - ${key}`));
  }
  if (placeholderMismatches.length > 0) {
    hasError = true;
    console.error(
      `❌ 中英文占位符不一致（仅检查字符串型消息）: ${placeholderMismatches.length} 个`,
    );
    placeholderMismatches.forEach((key) => console.error(`  - ${key}`));
  }

  if (sameTextWarnings.length > 0) {
    console.warn(
      `⚠️ 检测到 ${sameTextWarnings.length} 个中英文文本完全相同的 key（请确认是否有意保留英文）:`,
    );
    sameTextWarnings.forEach((key) => console.warn(`  - ${key}`));
  }

  if (hasError) {
    process.exit(1);
  }

  console.log(
    "✅ Translation verification passed: zh/en key parity and placeholder consistency are valid.",
  );
  process.exit(0);
} catch (error) {
  console.error("❌ Error verifying translations:", error);
  process.exit(1);
}
