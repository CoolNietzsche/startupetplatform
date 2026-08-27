import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Award, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsSummaryProps {
  total: number;
  certified: number;
  pending: number;
  className?: string;
  gridClassName?: string;
}

export function EcosystemStatsRow({
  total,
  certified,
  pending,
  className,
  gridClassName
}: StatsSummaryProps) {
  const stats = [
    {
      title: "Total Organizations",
      value: total,
      icon: Building,
      color: "text-blue-600",
      description: "Across all categories"
    },
    {
      title: "Certified Builders",
      value: certified,
      icon: Award,
      color: "text-green-600",
      description: total > 0 ? `${Math.round((certified / total) * 100)}% of total` : "0% of total"
    },
    {
      title: "In Process",
      value: pending,
      icon: Clock,
      color: "text-amber-600",
      description: "Pending or under review"
    }
  ];

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6", gridClassName, className)}>
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-sm border-slate-200/60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
            <div className={cn("p-2 rounded-lg bg-slate-50", stat.color)}>
                <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
