"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateCSV } from "@/lib/export";
import type { AdminDashboardStats } from "../actions";

export function DashboardExport({ stats }: { stats: AdminDashboardStats }) {
  const handleExport = () => {
    const rows: Record<string, string | number | null>[] = [
      { Metric: "Total Startups", Value: stats.totalStartups },
      { Metric: "Pending Applications", Value: stats.pendingReviews },
      { Metric: "Certified Entities", Value: stats.certifiedStartups + stats.certifiedEcosystemBuilders },
      { Metric: "Active Users", Value: stats.activeUsers },
      { Metric: "Success Rate", Value: `${stats.successRate}%` },
    ];
    stats.sectorDistribution.forEach((s) => {
      rows.push({ Metric: `Sector - ${s.sector}`, Value: s.count });
    });
    stats.certificationLevels.forEach((c) => {
      rows.push({ Metric: `Cert Level - ${c.level}`, Value: c.count });
    });
    stats.ecosystemBuilders.forEach((e) => {
      rows.push({ Metric: `Eco Builder - ${e.type}`, Value: e.count });
    });
    stats.monthlyApplications.forEach((m) => {
      rows.push({ Metric: `Apps ${m.month}`, Value: m.count });
    });
    stats.recentApplications.forEach((a) => {
      rows.push({ Metric: `Recent - ${a.name}`, Value: a.status, ID: a.id });
    });

    const headers = Object.keys(rows[0] || {});
    const csv = generateCSV({ filename: "ecosystem-analytics.csv", headers, rows });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ecosystem-analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}
