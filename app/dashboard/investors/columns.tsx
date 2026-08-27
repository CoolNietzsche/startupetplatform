'use client';

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Send } from "lucide-react";
import Link from "next/link";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { InvestorType, InvestmentStage } from "@prisma/client";

interface Investor {
    id: string;
    name: string;
    type: InvestorType;
    description: string | null;
    sectors: string[];
    stages: InvestmentStage[];
    ticketSize: string;
    regions: string[];
    isCertified: boolean;
}

export const columns: ColumnDef<Investor>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type: InvestorType = row.getValue("type");
            return (
                <Badge variant="outline">
                    {type.replace('_', ' ')}
                </Badge>
            );
        },
    },
    {
        accessorKey: "sectors",
        header: "Sectors",
        cell: ({ row }) => {
            const sectors: string[] = row.getValue("sectors");
            const displayCount = 2;

            return (
                <HoverCard>
                    <HoverCardTrigger>
                        <div className="flex gap-1">
                            {sectors.slice(0, displayCount).map((sector) => (
                                <Badge
                                    key={sector}
                                    variant="secondary"
                                    className="whitespace-nowrap"
                                >
                                    {sector}
                                </Badge>
                            ))}
                            {sectors.length > displayCount && (
                                <Badge variant="outline">
                                    +{sectors.length - displayCount}
                                </Badge>
                            )}
                        </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">All Sectors</h4>
                            <div className="flex flex-wrap gap-1">
                                {sectors.map((sector) => (
                                    <Badge
                                        key={sector}
                                        variant="secondary"
                                    >
                                        {sector}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </HoverCardContent>
                </HoverCard>
            );
        },
    },
    {
        accessorKey: "stages",
        header: "Investment Stages",
        cell: ({ row }) => {
            const stages: InvestmentStage[] = row.getValue("stages");
            const displayCount = 2;

            const formatStage = (stage: string) => {
                return stage.replace('_', ' ');
            };

            return (
                <HoverCard>
                    <HoverCardTrigger>
                        <div className="flex gap-1">
                            {stages.slice(0, displayCount).map((stage) => (
                                <Badge
                                    key={stage}
                                    variant="secondary"
                                    className="whitespace-nowrap"
                                >
                                    {formatStage(stage)}
                                </Badge>
                            ))}
                            {stages.length > displayCount && (
                                <Badge variant="outline">
                                    +{stages.length - displayCount}
                                </Badge>
                            )}
                        </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">All Stages</h4>
                            <div className="flex flex-wrap gap-1">
                                {stages.map((stage) => (
                                    <Badge
                                        key={stage}
                                        variant="secondary"
                                    >
                                        {formatStage(stage)}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </HoverCardContent>
                </HoverCard>
            );
        },
    },
    {
        accessorKey: "ticketSize",
        header: "Ticket Size",
    },
    {
        accessorKey: "regions",
        header: "Regions",
        cell: ({ row }) => {
            const regions: string[] = row.getValue("regions");
            const displayCount = 1;

            return (
                <HoverCard>
                    <HoverCardTrigger>
                        <div className="flex gap-1">
                            {regions.slice(0, displayCount).map((region) => (
                                <Badge
                                    key={region}
                                    variant="secondary"
                                    className="whitespace-nowrap"
                                >
                                    {region}
                                </Badge>
                            ))}
                            {regions.length > displayCount && (
                                <Badge variant="outline">
                                    +{regions.length - displayCount}
                                </Badge>
                            )}
                        </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">All Regions</h4>
                            <div className="flex flex-wrap gap-1">
                                {regions.map((region) => (
                                    <Badge
                                        key={region}
                                        variant="secondary"
                                    >
                                        {region}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </HoverCardContent>
                </HoverCard>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const investor = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/investors/${investor.id}`}>
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild disabled={!investor.isCertified}>
                            {investor.isCertified ? (
                                <Link href={`/dashboard/investors/${investor.id}/pitch`}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Pitch
                                </Link>
                            ) : (
                                <span className="flex items-center text-muted-foreground opacity-50 cursor-not-allowed">
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Pitch (Certification Required)
                                </span>
                            )}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
