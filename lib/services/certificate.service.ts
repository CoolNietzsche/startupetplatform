import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";
import { CERT_COLORS } from "@/lib/certificate-design-tokens";
import { getOfficialCertificateCopy } from "@/lib/certificate-official-copy";
import { escapeHtml } from "@/lib/certificate-html-escape";

export interface CertificateData {
  certificateType?: "STARTUP" | "ECOSYSTEM";
  startupName: string;
  certificateLevel: string;
  startDate: string;
  endDate: string;
  qrCodeDataUrl?: string;
  ministryLogoUrl?: string;
  companyLogoUrl?: string;
  certificateNumber?: string;
}

function formatLevelPill(level: string, certificateType: string): string {
  if (certificateType === "ECOSYSTEM") {
    return escapeHtml(level.toUpperCase());
  }
  if (level === "level-1") return "LEVEL 1 CERTIFICATION";
  if (level === "level-2") return "LEVEL 2 CERTIFICATION";
  if (level === "level-3") return "LEVEL 3 CERTIFICATION";
  return escapeHtml(level.replace(/-/g, " ").toUpperCase());
}

export class CertificateService {
  async generateHTML(data: CertificateData): Promise<string> {
    const {
      startupName,
      certificateLevel,
      startDate,
      endDate,
      qrCodeDataUrl,
      ministryLogoUrl: rawMinistryLogoUrl,
      certificateType = "STARTUP",
      certificateNumber,
    } = data;

    let ministryLogoUrl = rawMinistryLogoUrl;
    if (ministryLogoUrl && !ministryLogoUrl.startsWith("data:") && !ministryLogoUrl.startsWith("http")) {
      try {
        const logoPath = path.join(
          process.cwd(),
          "public",
          ministryLogoUrl.replace(/^\//, ""),
        );
        const logoBuffer = await fs.readFile(logoPath);
        const base64 = logoBuffer.toString("base64");
        const mimeType = ministryLogoUrl.endsWith(".png")
          ? "image/png"
          : "image/jpeg";
        ministryLogoUrl = `data:${mimeType};base64,${base64}`;
      } catch (error) {
        console.error("Failed to load ministry logo:", error);
      }
    }

    const copy = getOfficialCertificateCopy(
      certificateType === "ECOSYSTEM" ? "ECOSYSTEM" : "STARTUP",
    );
    const navy = CERT_COLORS.navy;
    const teal = CERT_COLORS.teal;
    const gold = "#d4a017";
    const slate900 = CERT_COLORS.slate900;
    const slate600 = CERT_COLORS.slate600;
    const borderGrey = CERT_COLORS.borderGrey;

    const safeName = escapeHtml(startupName);
    const safeCertNum = escapeHtml(certificateNumber || "—");
    const bodyHtml = copy.bodyParagraphs
      .map((p) => `<p class="body-p">${escapeHtml(p)}</p>`)
      .join("");
    const pill = formatLevelPill(certificateLevel, certificateType);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 297mm;
      height: 210mm;
      overflow: hidden;
    }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      color: ${slate900};
      background: #e2e8f0;
    }
    .page {
      width: 297mm;
      height: 210mm;
      background: ${CERT_COLORS.paper};
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .wm {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      opacity: 0.034;
      font-size: 10mm;
      font-weight: 900;
      color: ${teal};
      transform: rotate(-18deg);
      display: flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      letter-spacing: 0.08em;
    }
    .wm2 {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: repeating-linear-gradient(
        -12deg,
        transparent,
        transparent 5mm,
        rgba(17, 131, 141, 0.04) 5mm,
        rgba(17, 131, 141, 0.04) 5.3mm
      );
    }
    .bar-t, .bar-b {
      height: 1.2mm;
      background: ${teal};
      flex-shrink: 0;
    }
    .shell {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      border-left: 0.35mm solid ${borderGrey};
      border-right: 0.35mm solid ${borderGrey};
      position: relative;
    }
    .diamond {
      position: absolute;
      width: 2.2mm;
      height: 2.2mm;
      background: ${teal};
      transform: rotate(45deg);
      top: 50%;
      margin-top: -1.1mm;
      z-index: 2;
      box-shadow: 0 0 0 0.2mm #fff, 0 0 0 0.35mm ${borderGrey};
    }
    .diamond.l { left: -1.1mm; }
    .diamond.r { right: -1.1mm; }
    .head {
      display: grid;
      grid-template-columns: 28mm 1fr 32mm;
      align-items: center;
      gap: 2mm;
      padding: 2.5mm 4mm 2mm;
      border-bottom: 0.3mm solid #e2e8f0;
      flex-shrink: 0;
      background: #fff;
    }
    .logo {
      width: 26mm;
      max-height: 16mm;
      object-fit: contain;
      object-position: left center;
    }
    .htitle h1 {
      font-family: "Times New Roman", Georgia, serif;
      font-size: 5.2mm;
      font-weight: 800;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: ${slate900};
      line-height: 1.1;
      text-align: center;
    }
    .htitle p {
      font-size: 2.1mm;
      color: ${navy};
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-top: 1mm;
      text-align: center;
    }
    .qrbox {
      border: 0.45mm solid ${borderGrey};
      border-radius: 2.5mm;
      padding: 1mm;
      background: #fff;
      justify-self: end;
      box-shadow: 0 0.8mm 2mm rgba(0,0,0,0.06);
    }
    .qrbox img { width: 26mm; height: 26mm; display: block; }
    .mid {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5mm 10mm 1mm;
      overflow: hidden;
      background: #fff;
    }
    .lead {
      font-size: 2.5mm;
      color: ${slate600};
      margin-bottom: 0.8mm;
      text-align: center;
    }
    .name {
      font-family: "Great Vibes", Georgia, serif;
      font-size: 11mm;
      color: ${slate900};
      line-height: 1;
      margin-bottom: 1mm;
      max-width: 230mm;
      text-align: center;
    }
    .diamond-sm {
      width: 2mm;
      height: 2mm;
      background: ${teal};
      transform: rotate(45deg);
      margin: 1.5mm 0;
      box-shadow: 0 0 0 0.15mm rgba(255,255,255,0.9);
    }
    .body-block {
      font-size: 2.35mm;
      line-height: 1.38;
      color: ${slate600};
      max-width: 175mm;
      max-height: 22mm;
      overflow: hidden;
      text-align: justify;
      hyphens: auto;
    }
    .body-p { margin-bottom: 1.2mm; }
    .body-p:last-child { margin-bottom: 0; }
    .pill {
      background: linear-gradient(180deg, ${navy}, #0a3d4f);
      color: #fff;
      font-size: 2.7mm;
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 1.2mm 7mm;
      border-radius: 0.8mm;
      margin-top: 2mm;
      border: 0.2mm solid rgba(255,255,255,0.15);
    }
    .foot {
      flex-shrink: 0;
      display: grid;
      grid-template-columns: 1fr 34mm 1fr;
      align-items: end;
      gap: 2mm;
      padding: 2mm 5mm 2mm;
      border-top: 0.3mm solid #e2e8f0;
      background: #fff;
      font-size: 2.2mm;
    }
    .fc { min-width: 0; }
    .fc.r { text-align: right; align-items: flex-end; display: flex; flex-direction: column; }
    .fc.l { display: flex; flex-direction: column; align-items: flex-start; }
    .sig { width: 32mm; height: 8mm; color: #1e293b; }
    .dots {
      width: 100%;
      max-width: 36mm;
      border-bottom: 0.35mm dotted #94a3b8;
      margin: 0.6mm 0 0.8mm;
    }
    .fc.r .dots { align-self: flex-end; }
    .lbl {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 2.1mm;
      color: ${slate900};
    }
    .sub {
      font-size: 1.9mm;
      color: #64748b;
      margin-top: 0.3mm;
    }
    .seal-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
    }
    .seal {
      width: 18mm;
      height: 18mm;
      border-radius: 50%;
      border: 0.7mm solid ${gold};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2mm;
      font-weight: 900;
      color: ${navy};
      text-align: center;
      line-height: 1.15;
      background: linear-gradient(160deg, #fffbeb 0%, #fde68a 50%, #fbbf24 100%);
      box-shadow: 0 1.2mm 3mm rgba(0,0,0,0.12), inset 0 0.4mm 0 rgba(255,255,255,0.7);
    }
    .ribbons { display: flex; gap: 1mm; margin-top: 0.4mm; }
    .ribbons span {
      width: 2.2mm;
      height: 4mm;
      background: ${teal};
      border-radius: 0 0 0.6mm 0.6mm;
    }
    .mono {
      font-family: ui-monospace, monospace;
      font-size: 1.9mm;
      color: #64748b;
      margin-top: 0.4mm;
      font-weight: 600;
    }
    .band {
      height: 4mm;
      flex-shrink: 0;
      background:
        repeating-linear-gradient(90deg, ${teal}38 0, ${teal}38 1.2mm, transparent 1.2mm, transparent 3mm),
        repeating-linear-gradient(-45deg, transparent, transparent 1mm, ${teal}12 1mm, ${teal}12 1.3mm),
        linear-gradient(180deg, #f8fafc, #e2e8f0);
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="wm">NSLP · ${safeCertNum} · VERIFY</div>
    <div class="wm2"></div>
    <div class="bar-t"></div>
    <div class="shell">
      <div class="diamond l"></div>
      <div class="diamond r"></div>
      <div class="head">
        ${ministryLogoUrl ? `<img class="logo" src="${ministryLogoUrl}" alt="" />` : `<div></div>`}
        <div class="htitle">
          <h1>${escapeHtml(copy.documentTitle)}</h1>
          <p>${escapeHtml(copy.recognitionLine)}</p>
        </div>
        <div class="qrbox">
          ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="" />` : ""}
        </div>
      </div>
      <div class="mid">
        <p class="lead">${escapeHtml(copy.presentedLead)}</p>
        <div class="name">${safeName}</div>
        <div class="diamond-sm"></div>
        <div class="body-block">${bodyHtml}</div>
        <div class="pill">${pill}</div>
      </div>
      <div class="foot">
        <div class="fc l">
          <svg class="sig" viewBox="0 0 140 44" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 32 C 22 10, 38 38, 58 22 S 88 36, 108 18 S 128 28, 132 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/>
          </svg>
          <div class="dots"></div>
          <span class="lbl">Issue date: ${escapeHtml(startDate)}</span>
          <span class="sub">Valid until: ${escapeHtml(endDate)}</span>
        </div>
        <div class="fc seal-wrap">
          <div class="seal">OFFICIAL<br/>SEAL</div>
          <div class="ribbons"><span></span><span></span></div>
        </div>
        <div class="fc r">
          <svg class="sig" viewBox="0 0 140 44" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 26 Q 35 8, 52 30 T 96 20 Q 118 12, 128 30" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/>
          </svg>
          <div class="dots"></div>
          <span class="lbl">Authorized signature</span>
          <span class="mono">Credential: ${safeCertNum}</span>
        </div>
      </div>
      <div class="band"></div>
    </div>
    <div class="bar-b"></div>
  </div>
</body>
</html>`;
  }

  async generatePDF(data: CertificateData): Promise<Buffer> {
    const html = await this.generateHTML(data);
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({
        viewport: { width: 1123, height: 794 },
      });
      await page.setContent(html, { waitUntil: "load" });
      const pdfBuffer = await page.pdf({
        format: "A4",
        landscape: true,
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
        pageRanges: "1",
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async generateAndSave(data: CertificateData, filePath: string): Promise<Buffer> {
    const pdfBuffer = await this.generatePDF(data);
    const relativePath = filePath.replace(/^\//, "");
    const fullPath = path.join(process.cwd(), "public", relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, pdfBuffer);
    return pdfBuffer;
  }
}

export const certificateService = new CertificateService();
