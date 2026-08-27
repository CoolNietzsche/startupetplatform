import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function InvestorsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/auth/signin");

    const investors = await db.investor.findMany({
        where: {
            isActive: true,
            isVerified: true,
        },
        orderBy: {
            name: 'asc',
        },
    });

    const userCertified = await db.application.findFirst({
        where: {
            userId: session.user.id,
            status: "CERTIFIED",
        },
    });

    const isCertified = !!userCertified;

    const formattedInvestors = investors.map(investor => ({
        id: investor.id,
        name: investor.name,
        type: investor.type,
        description: investor.description,
        sectors: investor.sectors,
        stages: investor.preferredStages,
        ticketSize: investor.minTicketSize && investor.maxTicketSize
            ? `$${investor.minTicketSize.toLocaleString()} - $${investor.maxTicketSize.toLocaleString()}`
            : 'Not specified',
        regions: investor.regions,
        isCertified: isCertified,
    }));

    // Re-import icons if needed, but they are used in columns usually.
    // We will show a warning if not certified.

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Investor Database</h1>
                    <p className="text-muted-foreground mt-2">
                        Connect with investors interested in African startups
                    </p>
                </div>
            </div>

            {!isCertified && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
                    <div className="flex items-center gap-3 text-amber-800 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <h2 className="font-semibold text-lg">Startup Certification Required</h2>
                    </div>
                    <p className="text-amber-700 mb-4">
                        Your startup must be officially certified before you can send pitches to investors. 
                        Please complete your application and wait for approval from the committee.
                    </p>
                    <a 
                        href="/dashboard/application" 
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200 h-10 px-4 py-2"
                    >
                        Go to Certification
                    </a>
                </div>
            )}

            <DataTable
                columns={columns}
                data={formattedInvestors}
                searchKey="name"
                searchPlaceholder="Search investors..."
                filters={[
                    {
                        id: "type",
                        label: "Type",
                        options: [
                            { label: "Angel", value: "ANGEL" },
                            { label: "VC", value: "VC" },
                            { label: "Corporate", value: "CORPORATE" },
                            { label: "Accelerator", value: "ACCELERATOR" },
                            { label: "Government", value: "GOVERNMENT" },
                            { label: "Other", value: "OTHER" },
                        ],
                    },
                    {
                        id: "stages",
                        label: "Stage",
                        options: [
                            { label: "Seed", value: "SEED" },
                            { label: "Series A", value: "SERIES_A" },
                            { label: "Series B", value: "SERIES_B" },
                            { label: "Series C", value: "SERIES_C" },
                            { label: "Growth", value: "GROWTH" },
                            { label: "Late Stage", value: "LATE_STAGE" },
                        ],
                    },
                ]}
            />
        </div>
    );
}
