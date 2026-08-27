import { PitchForm } from "./_components/pitch-form";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface PitchPageProps {
    params: {
        id: string;
    };
}

export default async function PitchPage({ params }: PitchPageProps) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/auth/signin");

    const investor = await db.investor.findUnique({
        where: {
            id: params.id,
            isActive: true,
            isVerified: true,
        },
    });

    if (!investor) {
        notFound();
    }

    // Check if the startup is certified
    const certifiedApplication = await db.application.findFirst({
        where: {
            userId: session.user.id,
            status: "CERTIFIED",
        },
    });

    if (!certifiedApplication) {
        redirect("/dashboard/investors");
    }

    // Check if user has already pitched to this investor
    const existingPitch = await db.pitch.findFirst({
        where: {
            startupId: session.user.id,
            investorId: investor.id,
        },
    });

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Pitch to {investor.name}</h1>
                <p className="text-muted-foreground mt-2">
                    Send your pitch to {investor.name}. Make sure to include all relevant information about your startup.
                </p>
            </div>

            {existingPitch && (
                <div className="bg-muted p-4 rounded-lg mb-8">
                    <h2 className="font-semibold">Previous Pitch</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        You have already sent a pitch to this investor on{" "}
                        {existingPitch.createdAt.toLocaleDateString()}. Status:{" "}
                        <span className="font-medium">{existingPitch.status}</span>
                        <Badge variant={existingPitch.status === "approved" ? "default" : "secondary"} className="ml-2">{existingPitch.status}</Badge>
                    </p>
                    {existingPitch.response && (
                        <div className="mt-4">
                            <h3 className="font-medium">Response:</h3>
                            <p className="text-sm mt-1">{existingPitch.response}</p>
                        </div>
                    )}
                </div>
            )}

            <PitchForm
                investor={investor}
                existingPitch={existingPitch || undefined}
            />
        </div>
    );
}
