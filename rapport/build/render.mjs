/**
 * Renders rapport.html to A4 PDF and reports, per page, how much content
 * overflows the fixed .page box. Any positive overflow means text is being
 * clipped and must be trimmed before the report is considered done.
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, '../rapport.html');
const out = path.resolve(here, '../Teknologirapport-2026.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(fs.readFileSync(src, 'utf8'), { waitUntil: 'load' });

const report = await page.evaluate(() => {
  const pages = [...document.querySelectorAll('.page')];
  return pages.map((el, i) => {
    if (el.classList.contains('cover')) {
      return { n: i + 1, usedMm: 0, limitMm: 284, overflowMm: 0, slackMm: 0, cover: true };
    }
    const body = el.querySelector('.body') || el;
    // Measure the true content extent relative to the page box.
    const pageBox = el.getBoundingClientRect();
    let lowest = 0;
    for (const child of body.querySelectorAll('*')) {
      const r = child.getBoundingClientRect();
      if (r.height === 0) continue;
      lowest = Math.max(lowest, r.bottom - pageBox.top);
    }
    const pxPerMm = 96 / 25.4;
    const limitPx = (297 - 13) * pxPerMm;      // page height minus bottom padding
    return {
      n: i + 1,
      usedMm: +((lowest) / pxPerMm).toFixed(1),
      limitMm: +(limitPx / pxPerMm).toFixed(1),
      overflowMm: +((lowest - limitPx) / pxPerMm).toFixed(1),
      slackMm: +((limitPx - lowest) / pxPerMm).toFixed(1),
    };
  });
});

await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();

const pdf = fs.readFileSync(out);
const pdfPages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;

console.log(`\nPDF: ${out}`);
console.log(`Sider i PDF: ${pdfPages}   (.page-seksjoner i HTML: ${report.length})\n`);
console.log('side  brukt(mm)  ledig(mm)  status');
let bad = 0;
for (const r of report) {
  const status = r.cover ? 'forside (hoppes over)'
    : r.overflowMm > 0 ? `OVERFLOW +${r.overflowMm}mm`
    : (r.slackMm > 22 ? `tynn (${r.slackMm}mm ledig)` : 'ok');
  if (r.overflowMm > 0) bad++;
  console.log(
    String(r.n).padStart(4) +
    String(r.usedMm).padStart(11) +
    String(r.slackMm).padStart(11) +
    '  ' + status
  );
}
console.log(`\nSider med overflow: ${bad}`);
if (pdfPages !== 30) console.log(`!! Sidetall er ${pdfPages}, skal være 30.`);
