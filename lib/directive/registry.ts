export interface RegistryEntry {
  certificateNumber: string;
  entityName: string;
  entityType: "startup" | "ecosystem";
  entitySubType: string;
  stage: string;
  certificateStatus: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "REVOKED";
  issuedAt: Date;
  expiresAt: Date | null;
  region: string;
  sector?: string;
}

export interface RegistryStats {
  totalActive: number;
  totalSuspended: number;
  totalRevoked: number;
  totalExpired: number;
  startupsByStage: Record<string, number>;
  ecosystemByType: Record<string, number>;
  byRegion: Record<string, number>;
}

export function computeRegistryStats(entries: RegistryEntry[]): RegistryStats {
  const stats: RegistryStats = {
    totalActive: 0,
    totalSuspended: 0,
    totalRevoked: 0,
    totalExpired: 0,
    startupsByStage: {},
    ecosystemByType: {},
    byRegion: {},
  };

  for (const entry of entries) {
    stats.byRegion[entry.region] = (stats.byRegion[entry.region] || 0) + 1;

    if (entry.entityType === "startup") {
      stats.startupsByStage[entry.stage] = (stats.startupsByStage[entry.stage] || 0) + 1;
    } else {
      stats.ecosystemByType[entry.entitySubType] = (stats.ecosystemByType[entry.entitySubType] || 0) + 1;
    }

    switch (entry.certificateStatus) {
      case "ACTIVE": stats.totalActive++; break;
      case "SUSPENDED": stats.totalSuspended++; break;
      case "REVOKED": stats.totalRevoked++; break;
      case "EXPIRED": stats.totalExpired++; break;
    }
  }

  return stats;
}

export function searchRegistry(entries: RegistryEntry[], query: string): RegistryEntry[] {
  if (!query || !query.trim()) return entries;
  const q = query.toLowerCase().trim();
  return entries.filter(e =>
    e.entityName.toLowerCase().includes(q) ||
    e.certificateNumber.toLowerCase().includes(q) ||
    e.region.toLowerCase().includes(q) ||
    e.sector?.toLowerCase().includes(q)
  );
}

export const REGISTRY_DIRECTIVE_REF = "Art. 8, 10";
