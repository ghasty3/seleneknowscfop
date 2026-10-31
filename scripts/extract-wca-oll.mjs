/**
 * Extrae la lámina oficial de OLL 57 (Feliks Zemdegs & Andy Klise, WCA) del PDF del repo
 * `oll-algorithms.pdf` y escribe `scripts/fixtures/wca-oll.json`.
 *
 * El PDF es multi-columna y con Form XObjects: el orden de texto plano NO es legible.
 * Por eso se leen las coordenadas de cada línea (MuPDF toStructuredText) y se agrupa por
 * proximidad espacial alrededor de cada etiqueta `NOMBRE - nºWCA - Probability = 1/x`:
 * los algoritmos sugeridos van POR ENCIMA de la etiqueta y los alternativos POR DEBAJO.
 *
 * Dependencia (fuera del repo, no es del proyecto): `npm i mupdf` en una carpeta aparte.
 * Uso:
 *   mkdir -p /tmp/tools && cd /tmp/tools && npm i mupdf
 *   cp scripts/extract-wca-oll.mjs /tmp/tools/    # Node resuelve node_modules desde la carpeta del script
 *   cd /tmp/tools && node extract-wca-oll.mjs /workspaces/cubo/oll-algorithms.pdf \
 *        /workspaces/cubo/scripts/fixtures/wca-oll.json
 *
 * Resultado medido (2026-10-31): 57 casos, 128 algoritmos, 0 faltan, 29 casos con alternativos.
 * Comprobado con `npx tsx scripts/check-wca-oll.mts`: parser OK y plantado+alg resuelto en 128/128.
 */
import * as mupdf from 'mupdf';
import fs from 'fs';
const pdf=process.argv[2];
const doc=mupdf.Document.openDocument(fs.readFileSync(pdf),'application/pdf');
const L=[];
for(let p=0;p<doc.countPages();p++){
  const j=JSON.parse(doc.loadPage(p).toStructuredText('').asJSON());
  j.blocks.forEach((b,bi)=>b.lines.forEach(l=>{const t=l.text.trim();if(t.trim())L.push({p,bi,x:l.bbox.x,y:l.bbox.y,t})}))
}
const LABEL=/^([A-Za-z]+\d*)\s*-\s*(\d+)\s*-\s*Probability\s*=\s*1\/(\d+)$/;
const labels=L.map(l=>({l,m:LABEL.exec(l.t)})).filter(o=>o.m);
const NOT=/^[RULDFBrubdflSME'2xyzk\s()]+$/;
const recs=labels.map(({l,m})=>{
  const near=L.filter(o=>o.p===l.p&&o!==l&&Math.abs(o.x-l.x)<70&&Math.abs(o.y-l.y)<48&&NOT.test(o.t)&&/[RULDFB]/.test(o.t));
  const sug=near.filter(o=>o.y<l.y).sort((a,b)=>a.y-b.y).map(o=>o.t);
  const alt=near.filter(o=>o.y>l.y).sort((a,b)=>a.y-b.y).map(o=>o.t);
  return {name:m[1],wca:+m[2],prob:`1/${m[3]}`,suggested:sug,alt};
}).sort((a,b)=>a.wca-b.wca);
const missing=[...Array(57).keys()].map(i=>i+1).filter(n=>!recs.some(r=>r.wca===n));
console.log('casos',recs.length,'faltan',missing.join(',')||'ninguno','| sin sugerido:',recs.filter(r=>!r.suggested.length).map(r=>r.wca).join(','),'| sin alt:',recs.filter(r=>!r.alt.length).map(r=>r.wca).join(','));
const out=process.argv[3] ?? '/tmp/wca-oll.json'
fs.writeFileSync(out,JSON.stringify(recs,null,2)+'\n')
console.log('->',out)
