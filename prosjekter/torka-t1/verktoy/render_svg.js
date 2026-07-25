// Rendrer en SVG-fil til hoyopplost PNG med Chromium (Playwright).
// Bruk: node render_svg.js <inn.svg> <ut.png> [skala]
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const [, , inFile, outFile, scaleArg] = process.argv;
  if (!inFile || !outFile) {
    console.error('Bruk: node render_svg.js <inn.svg> <ut.png> [skala]');
    process.exit(1);
  }
  const scale = Number(scaleArg || 2);
  const svg = fs.readFileSync(inFile, 'utf8');
  const w = Number(/width="(\d+)"/.exec(svg)[1]);
  const h = Number(/height="(\d+)"/.exec(svg)[1]);

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: w, height: h },
    deviceScaleFactor: scale,
  });
  await page.goto('file://' + path.resolve(inFile));
  await page.screenshot({ path: outFile, omitBackground: false });
  await browser.close();
  console.log(`skrev ${outFile} (${w}x${h} @ ${scale}x)`);
})();
