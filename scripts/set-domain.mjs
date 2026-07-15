import { promises as fs } from "node:fs";
import path from "node:path";

const raw = process.argv[2];
if (!raw) {
  console.error("사용법: npm run set-domain -- https://example.com");
  process.exit(1);
}

let origin;
try {
  origin = new URL(raw).origin;
} catch {
  console.error("올바른 전체 주소를 입력하세요. 예: https://luckylab.kr");
  process.exit(1);
}

const root = path.resolve("public");
const targets = ["index.html", "robots.txt", "sitemap.xml"];
for (const file of targets) {
  const full = path.join(root, file);
  let content = await fs.readFile(full, "utf8");
  content = content.replaceAll("https://YOUR-DOMAIN.com", origin);
  await fs.writeFile(full, content, "utf8");
  console.log(`수정 완료: ${file}`);
}
console.log(`사이트 주소 적용 완료: ${origin}`);
