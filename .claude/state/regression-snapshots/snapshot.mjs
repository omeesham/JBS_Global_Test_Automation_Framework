// One-shot snapshot helper for /regression-guard. Usage: node snapshot.mjs <out.json>
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const targets = ["scripts", ".claude/hooks", ".claude/settings.json", ".claude/rules", ".claude/skills/relevant"];
const out = {};
function walk(p) {
  let st;
  try { st = fs.statSync(p); } catch { return; }
  if (st.isFile()) {
    const norm = p.replaceAll("\\", "/");
    out[norm] = crypto.createHash("sha1").update(fs.readFileSync(p)).digest("hex").slice(0, 12);
    return;
  }
  if (st.isDirectory()) for (const e of fs.readdirSync(p)) walk(path.join(p, e));
}
for (const t of targets) walk(t);
const dest = process.argv[2] || ".claude/state/regression-snapshots/snapshot.json";
fs.writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(`snapshot files: ${Object.keys(out).length} -> ${dest}`);
