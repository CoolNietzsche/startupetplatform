import { chromium } from "playwright";
import type { PdfExportData } from "./export";

function buildPdfHtml(data: PdfExportData): string {
  const meta = data.generatedAt ? `<p class="meta">Generated: ${data.generatedAt}${data.generatedBy ? ` by ${data.generatedBy}` : ""}</p>` : "";
  const sectionsHtml = data.sections.map((s) => {
    let content = "";
    if (s.table) {
      const th = s.table.headers.map((h) => `<th>${h}</th>`).join("");
      const tr = s.table.rows.map((r) =>
        `<tr>${s.table!.headers.map((h) => `<td>${r[h] ?? ""}</td>`).join("")}</tr>`
      ).join("");
      content = `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
    }
    if (s.metrics) {
      content = `<div class="metrics">${s.metrics.map((m) => `<div class="metric"><span class="mval">${m.value}</span><span class="mlabel">${m.label}</span></div>`).join("")}</div>`;
    }
    return `<div class="section"><h2>${s.heading}</h2>${content}</div>`;
  }).join("");

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><style>
  @page { margin: 20mm 15mm; }
  body { font-family: 'Inter', Arial, sans-serif; color: #1e293b; font-size: 11pt; line-height: 1.5; }
  h1 { font-size: 20pt; font-weight: 900; margin-bottom: 2px; }
  .sub { color: #64748b; font-size: 10pt; margin-bottom: 20px; }
  .meta { color: #94a3b8; font-size: 8pt; margin-bottom: 20px; }
  .section { margin-bottom: 24px; page-break-inside: avoid; }
  h2 { font-size: 14pt; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; }
  th { background: #f1f5f9; text-align: left; padding: 6px 8px; font-weight: 700; border: 1px solid #e2e8f0; }
  td { padding: 5px 8px; border: 1px solid #e2e8f0; }
  .metrics { display: flex; gap: 16px; flex-wrap: wrap; }
  .metric { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 20px; text-align: center; min-width: 100px; }
  .mval { display: block; font-size: 18pt; font-weight: 900; color: #0f172a; }
  .mlabel { display: block; font-size: 7pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
  .footer { text-align: center; font-size: 7pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 30px; }
</style></head><body>
  <h1>${data.title}</h1>
  ${data.subtitle ? `<p class="sub">${data.subtitle}</p>` : ""}
  ${meta}
  ${sectionsHtml}
  <div class="footer">National Startup Registration &amp; Regional STI Hub Management System — Ministry of Innovation &amp; Technology</div>
</body></html>`;
}

export async function generatePDF(data: PdfExportData): Promise<Buffer> {
  const html = buildPdfHtml(data);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    await page.setContent(html, { waitUntil: "networkidle" });
    const buf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" } });
    return Buffer.from(buf);
  } finally {
    await browser.close();
  }
}
