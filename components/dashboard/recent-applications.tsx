import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ApplicationStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface RecentApplicationsProps {
    applications: Array<{
        id: string;
        startupName: string;
        status: ApplicationStatus;
        createdAt: Date;
    }>;
}

const statusColors: Record<ApplicationStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SUBMITTED: "bg-blue-100 text-blue-800",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
};

export function RecentApplications({ applications }: RecentApplicationsProps) {
    return (
        <div className="space-y-4">
            <div className="text-xl font-semibold">Recent Applications</div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Startup Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.map((application) => (
                            <TableRow key={application.id}>
                                <TableCell>
                                    <Link 
                                        href={`/dashboard/applications/${application.id}`}
                                        className="hover:underline"
                                    >
                                        {application.startupName || "Unnamed Startup"}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[application.status]}`}>
                                        {application.status.replace(/_/g, " ")}
                                    </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                                </TableCell>
                            </TableRow>
                        ))}
                        {applications.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                    No recent applications
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
