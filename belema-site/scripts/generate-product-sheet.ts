import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { site } from "../content/site";
import products from "../content/products.json";
import en from "../content/messages/en.json";
import am from "../content/messages/am.json";

const root = resolve(process.cwd());
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
}[character] ?? character));

const sizeCards = products.products.map((product) => `
  <article class="size-card"><strong>${escapeHtml(product.size)}</strong><p>${escapeHtml(en.fine.uses[product.id as keyof typeof en.fine.uses])}</p><p lang="am">${escapeHtml(am.fine.uses[product.id as keyof typeof am.fine.uses])}</p></article>`).join("");
const rows = products.analysis.values.map((row) => {
  const key = row.nameKey.split(".").at(-1) as keyof typeof en.fine.analysis;
  const unit = key === "ph" ? "—" : products.analysis.unit;
  return `<tr><th scope="row">${escapeHtml(en.fine.analysis[key])}<br><span lang="am">${escapeHtml(am.fine.analysis[key])}</span></th><td>${escapeHtml(row.value)}</td><td>${escapeHtml(unit)}</td></tr>`;
}).join("");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fine Water — Product Sheet</title><style>
@page { size: A4; margin: 10mm; }
* { box-sizing: border-box; }
:root { color-scheme: light; }
body { margin: 0; color: #102d45; font: 8.2pt/1.35 Arial, "Noto Sans Ethiopic", sans-serif; }
h1,h2,h3,p { margin: 0; }
.sheet { width: 100%; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12mm; border-bottom: 2px solid #0a9dd1; padding-bottom: 4mm; }
.kicker { color: #2b7100; font-size: 7pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h1 { margin-top: 1mm; color: #0b2e5e; font-size: 22pt; line-height: 1.05; }
.tagline { margin-top: 1.5mm; color: #52697d; font-size: 8pt; }
.label { flex: 0 0 auto; border-radius: 2mm; background: #f2f9fc; padding: 3mm; color: #0b2e5e; font-size: 7.5pt; font-weight: 700; text-align: right; }
.sizes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2mm; margin-top: 4mm; }
.size-card { min-height: 26mm; border: 1px solid #dce9ef; border-radius: 2.2mm; padding: 2.5mm; }
.size-card strong { color: #08457c; font-size: 15pt; }
.size-card p { margin-top: 1mm; color: #52697d; font-size: 6.7pt; }
.columns { display: grid; grid-template-columns: 1.18fr .82fr; gap: 5mm; margin-top: 4mm; }
h2 { margin: 0 0 2mm; color: #0b2e5e; font-size: 11pt; }
.analysis { width: 100%; border-collapse: collapse; font-size: 7pt; }
.analysis th,.analysis td { border-bottom: 1px solid #e2ebef; padding: 1.15mm 1.6mm; text-align: left; vertical-align: middle; }
.analysis thead th { background: #f2f9fc; color: #0b2e5e; font-size: 6.8pt; }
.analysis tbody th { width: 58%; font-weight: 600; }
.analysis tbody th span { color: #52697d; font-weight: 400; }
.analysis tbody td { white-space: nowrap; }
.note { margin-top: 2mm; border-left: 2px solid #7aa83a; background: #f5f9ed; padding: 2mm; color: #294516; font-size: 6.8pt; }
.info { border: 1px solid #dce9ef; border-radius: 2mm; margin-bottom: 3mm; padding: 3mm; }
.info p { margin-top: 1.4mm; color: #52697d; font-size: 7.2pt; }
.license { color: #08457c !important; font-size: 9pt !important; font-weight: 800; }
.footer { margin-top: 3mm; border-top: 1px solid #dce9ef; padding-top: 2mm; color: #52697d; font-size: 6.7pt; }
[lang="am"] { font-family: "Noto Sans Ethiopic", Arial, sans-serif; }
</style></head><body><main class="sheet">
<header class="header"><div><p class="kicker">${escapeHtml(site.legalName)}</p><h1>${escapeHtml(site.brandName)} <span lang="am">| የምርት ማብራሪያ</span></h1><p class="tagline">Purified bottled drinking water · የተጣራ የታሸገ የመጠጥ ውሃ</p></div><div class="label">${escapeHtml(site.tagline)}<br><span lang="am">${escapeHtml(am.home.waterLabel)}</span></div></header>
<section class="sizes" aria-label="Bottle sizes">${sizeCards}</section>
<div class="columns"><section><h2>${escapeHtml(en.fine.analysisTitle)} <span lang="am">/ ${escapeHtml(am.fine.analysisTitle)}</span></h2><table class="analysis"><thead><tr><th>${escapeHtml(en.fine.analysisName)} / ${escapeHtml(am.fine.analysisName)}</th><th>${escapeHtml(en.fine.analysisValue)} / ${escapeHtml(am.fine.analysisValue)}</th><th>${escapeHtml(en.fine.analysisUnit)} / ${escapeHtml(am.fine.analysisUnit)}</th></tr></thead><tbody>${rows}</tbody></table><p class="note"><strong>Verify before use / ከመጠቀም በፊት ያረጋግጡ:</strong> ${escapeHtml(en.fine.analysisNote)}<br><span lang="am">${escapeHtml(am.fine.analysisNote)}</span></p></section>
<aside><section class="info"><h2>${escapeHtml(en.fine.qualityTitle)} / ${escapeHtml(am.fine.qualityTitle)}</h2><p class="license">${escapeHtml(site.certification.label)}</p><p>${escapeHtml(site.certification.issuer)}</p><p>${escapeHtml(en.fine.qualityText)}</p></section><section class="info"><h2>${escapeHtml(en.fine.storageTitle)} / ${escapeHtml(am.fine.storageTitle)}</h2><p>${escapeHtml(en.fine.storageText)}</p><p lang="am">${escapeHtml(am.fine.storageText)}</p></section></aside></div>
<footer class="footer">Label analysis transcribed from the supplied label; it has not been independently verified. License scope/current validity and all label values require confirmation against current documents. / የመለያ መረጃው ከተሰጠው ጽሑፍ ተገልብጧል፤ በተናጠል አልተረጋገጠም።</footer>
</main></body></html>`;

async function main() {
  await mkdir(resolve(root, "public"), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1697 } });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const outputPath = resolve(root, "public", site.productSheetPath.slice(1));
    await page.pdf({ path: outputPath, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" } });
    console.log(`Created ${outputPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
