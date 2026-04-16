const fs = require("fs");
const path = require("path");

const appRoot = path.resolve(__dirname, "../../..");
const i18nRoot = path.resolve(__dirname, "..");

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      walk(p, out);
      continue;
    }
    if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
}

function collectUsedKeys() {
  const files = [];
  walk(path.join(appRoot, "src"), files);
  const keys = new Set();
  const tExpr = /\bt\(\s*["'`]([^"'`]+)["'`]/g;
  const staticExpr = /getStaticTranslation\(\s*["'`][^"'`]+["'`]\s*,\s*["'`]([^"'`]+)["'`]/g;

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const m of text.matchAll(tExpr)) keys.add(m[1]);
    for (const m of text.matchAll(staticExpr)) keys.add(m[1]);
  }

  return [...keys].sort();
}

function readLocale(file) {
  return JSON.parse(fs.readFileSync(path.join(i18nRoot, file), "utf8"));
}

const used = collectUsedKeys();
const en = readLocale("en.json");
const zh = readLocale("zh_Hans.json");

const missEn = used.filter((k) => !(k in en));
const missZh = used.filter((k) => !(k in zh));

if (missEn.length || missZh.length) {
  if (missEn.length) {
    console.error("Missing in en.json:");
    for (const k of missEn) console.error(`  - ${k}`);
  }
  if (missZh.length) {
    console.error("Missing in zh_Hans.json:");
    for (const k of missZh) console.error(`  - ${k}`);
  }
  process.exit(1);
}

console.log(`OK: ${used.length} used keys are present in en.json and zh_Hans.json.`);
