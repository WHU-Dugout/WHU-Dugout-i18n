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
  const dottedKeyExpr = /["'`]([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9]+)+)["'`]/g;

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const m of text.matchAll(dottedKeyExpr)) keys.add(m[1]);
  }

  return keys;
}

function readLocale(file) {
  return JSON.parse(fs.readFileSync(path.join(i18nRoot, file), "utf8"));
}

const used = collectUsedKeys();
const en = readLocale("en.json");
const zh = readLocale("zh_Hans.json");

const all = new Set([...Object.keys(en), ...Object.keys(zh)]);
const unused = [...all].filter((k) => !used.has(k)).sort();

if (unused.length) {
  console.error("Unused keys:");
  for (const k of unused) console.error(`  - ${k}`);
  process.exit(1);
}

console.log(`OK: no unused keys in en.json / zh_Hans.json.`);
