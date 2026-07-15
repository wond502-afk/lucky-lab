import { promises as fs } from "node:fs";
import path from "node:path";

const required = [
  "public/index.html",
  "public/assets/style.css",
  "public/assets/app.js",
  "public/privacy.html",
  "public/terms.html",
  "public/contact.html",
  "public/robots.txt",
  "public/sitemap.xml",
  "public/ads.txt",
  "functions/api/lotto.js",
  "functions/api/health.js",
  "wrangler.toml"
];

let failed = false;
for (const file of required) {
  try { await fs.access(path.resolve(file)); console.log(`OK  ${file}`); }
  catch { console.error(`누락 ${file}`); failed = true; }
}

const index = await fs.readFile("public/index.html", "utf8");
for (const token of ["assets/style.css", "assets/app.js", "wond502@gmail.com"]) {
  if (!index.includes(token) && token !== "wond502@gmail.com") {
    console.error(`index.html 연결 누락: ${token}`); failed = true;
  }
}
const contact = await fs.readFile("public/contact.html", "utf8");
if (!contact.includes("wond502@gmail.com")) { console.error("문의 이메일 누락"); failed = true; }

if (failed) process.exit(1);
console.log("\n배포 전 기본 검사 통과");
