'use server'

import { ApplicationStatus } from "@prisma/client";
import { ensureAdmin } from "@/lib/security";
import db from "@/lib/db";

export type ApplicationStats = {
    total: number;
    byStatus: Record<string, number>;
    recentApplications: Array<{
        id: string;
        startupName: string;
        status: ApplicationStatus;
        createdAt: Date;
    }>;
    industryDistribution: Array<{
        industry: string;
        count: number;
    }>;
}

export async function getApplicationStatistics(): Promise<ApplicationStats> {
    await ensureAdmin();

    const statusCounts: Record<string, number> = {
        DRAFT: 0, PENDING: 0, UNDER_REVIEW: 0, REVIEWED: 0,
        ASSIGNED_TO_COMMITTEE: 0, IN_COMMITTEE_REVIEW: 0,
        COMMITTEE_REVIEW_SUBMITTED: 0, CERTIFIED: 0, REJECTED: 0,
        ROLLED_BACK: 0, CLARIFICATION_REQUESTED: 0, PAUSED: 0, EXPIRED: 0,
    };

    const statusAgg = await db.application.groupBy({
        by: ["status"],
        _count: { id: true },
    });

    for (const row of statusAgg) {
        statusCounts[row.status] = row._count.id;
    }

    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

    const recentApplications = await db.application.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
            id: true,
            startupName: true,
            status: true,
            createdAt: true,
        },
    });

    const industryAgg = await db.application.groupBy({
        by: ["sector"],
        _count: { id: true },
    });

    const industryDistribution = industryAgg.map((row) => ({
        industry: row.sector || "Unknown",
        count: row._count.id,
    }));

    return {
        total,
        byStatus: statusCounts,
        recentApplications,
        industryDistribution,
    };
}
