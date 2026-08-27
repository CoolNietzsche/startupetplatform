export interface ExportData {
  filename: string;
  headers: string[];
  rows: Record<string, string | number | boolean | null>[];
}

export interface PdfExportData {
  title: string;
  subtitle?: string;
  sections: {
    heading: string;
    table?: { headers: string[]; rows: Record<string, string | number | boolean | null>[] };
    metrics?: { label: string; value: string | number }[];
  }[];
  generatedAt?: string;
  generatedBy?: string;
}

export function generateCSV(data: ExportData): string {
  const headerRow = data.headers.join(",");
  const bodyRows = data.rows.map((row) =>
    data.headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(",")
  );
  return [headerRow, ...bodyRows].join("\n");
}

export function generateJSON(data: ExportData): string {
  const mapped = data.rows.map((row) => {
    const obj: Record<string, unknown> = {};
    data.headers.forEach((h) => { obj[h] = row[h] ?? ""; });
    return obj;
  });
  return JSON.stringify(mapped, null, 2);
}
