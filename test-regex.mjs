import { readFileSync } from 'node:fs';
const src = readFileSync('./scripts/walk-coverage/enumerate-page.mjs','utf-8');
const mod = 'pricing';
const esc = mod.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Match unquoted OR quoted key followed by colon + opening brace
const rx = new RegExp(`(?:^|\\n)[ \\t]*(?:['"\`]${esc}['"\`]|${esc})\\s*:\\s*\\{`, 'i');
const km = src.match(rx);
if (!km) { console.log('NO MATCH'); process.exit(1); }
let d=1, i=km.index+km[0].length;
while(i<src.length&&d>0){const c=src[i];if(c==='{')d++;else if(c==='}')d--;i++;}
const block=src.slice(km.index+km[0].length,i-1);
const rsM=block.match(/requiredStates\s*:\s*\[([\s\S]*?)\]/);
const labels=[]; const lrx=/\{\s*label\s*:\s*['"`]([^'"`]+)['"`]\s*\}/g; let lm;
while((lm=lrx.exec(rsM?.[1]||''))!==null) labels.push(lm[1]);
console.log('labels:', JSON.stringify(labels));
process.exit(labels.length===2 ? 0 : 1);
