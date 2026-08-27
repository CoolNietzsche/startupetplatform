"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  TrendingUp, 
  Building2, 
  Users, 
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  ArrowUpRight,
  LineChart,
  PieChart,
  Download,
  Filter
} from "lucide-react";
import Link from "next/link";

// Mock data for Ethiopian startup ecosystem
const sectorData = [
  { sector: "Agriculture Tech", count: 67, growth: 14.2, fundingMil: 5.2 },
  { sector: "Fintech", count: 54, growth: 28.7, fundingMil: 8.6 },
  { sector: "Health Tech", count: 42, growth: 17.5, fundingMil: 4.8 },
  { sector: "E-commerce", count: 39, growth: 22.3, fundingMil: 6.1 },
  { sector: "Edtech", count: 31, growth: 19.2, fundingMil: 3.5 },
  { sector: "Clean Energy", count: 28, growth: 31.4, fundingMil: 9.7 },
  { sector: "Logistics", count: 23, growth: 15.8, fundingMil: 4.2 },
  { sector: "Tourism Tech", count: 19, growth: 12.1, fundingMil: 2.8 }
];

const regionData = [
  { region: "Addis Ababa", startups: 234, percentage: 58 },
  { region: "Dire Dawa", startups: 42, percentage: 10 },
  { region: "Hawassa", startups: 38, percentage: 9 },
  { region: "Bahir Dar", startups: 32, percentage: 8 },
  { region: "Mekelle", startups: 28, percentage: 7 },
  { region: "Adama", startups: 21, percentage: 5 },
  { region: "Other Regions", startups: 12, percentage: 3 }
];

const fundingTrends = [
  { year: 2022, amount: 14.2 },
  { year: 2023, amount: 23.7 },
  { year: 2024, amount: 35.4 },
  { year: 2025, amount: 42.1, projected: true }
];

const competitionTrends = [
  { program: "MSME Innovation Fund", applicants: 342, awards: 28 },
  { program: "Digital Ethiopia Initiative", applicants: 287, awards: 23 },
  { program: "Startup Ethiopia Accelerator", applicants: 412, awards: 35 },
  { program: "AgriTech Innovation Challenge", applicants: 198, awards: 15 },
  { program: "Ethiopian Women in Tech", applicants: 231, awards: 20 }
];

const marketInsights = [
  {
    id: "i1",
    title: "Agriculture Tech Boom",
    description: "Ethiopian AgriTech startups have seen a 14.2% growth in 2025, with particular focus on supply chain innovations.",
    date: "April 20, 2025",
    category: "Trend"
  },
  {
    id: "i2",
    title: "Fintech User Adoption",
    description: "Mobile payment solutions have reached 38% penetration in urban centers, up from 24% last year.",
    date: "April 15, 2025",
    category: "Research"
  },
  {
    id: "i3",
    title: "Government Initiative Impact",
    description: "The Digital Ethiopia 2025 initiative has directly supported 87 startups in Q1 2025.",
    date: "April 10, 2025",
    category: "Policy"
  }
];

export default function MarketInsightsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Market Insights</h2>
          <p className="text-muted-foreground">
            Ethiopian startup ecosystem analytics and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sectors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="regions">Regional Distribution</TabsTrigger>
          <TabsTrigger value="funding">Funding Landscape</TabsTrigger>
          <TabsTrigger value="competition">Funding Competition</TabsTrigger>
        </TabsList>

        <TabsContent value="sectors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Performing Sector</CardTitle>
                <CardDescription>Q1 2025 Analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Clean Energy</div>
                <p className="text-xs text-muted-foreground">
                  31.4% YoY Growth
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div className="text-sm text-green-700">Highest momentum sector</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Most Funded Sector</CardTitle>
                <CardDescription>By Total Investment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Fintech</div>
                <p className="text-xs text-muted-foreground">
                  $8.6M in Investments
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div className="text-sm text-green-700">28% of total startup funding</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Startup Density</CardTitle>
                <CardDescription>By Count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Agriculture Tech</div>
                <p className="text-xs text-muted-foreground">
                  67 Active Startups
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <div className="text-sm text-blue-700">22% of all registered startups</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Sector Analysis
              </CardTitle>
              <CardDescription>
                Breakdown of startup activity across key Ethiopian sectors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectorData.map(sector => (
                  <div key={sector.sector} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary/80"></div>
                        <span className="font-medium">{sector.sector}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {sector.count} Startups
                        </Badge>
                        <div className={`text-xs font-medium flex items-center gap-1 ${sector.growth > 20 ? 'text-green-600' : 'text-blue-600'}`}>
                          <TrendingUp className="h-3 w-3" />
                          {sector.growth}%
                        </div>
                        <div className="text-xs font-medium">
                          ${sector.fundingMil}M
                        </div>
                      </div>
                    </div>
                    <Progress value={(sector.count / sectorData[0].count) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Startup Distribution by Region
                </CardTitle>
                <CardDescription>
                  Ethiopian startup geographical analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionData.map(region => (
                    <div key={region.region} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{region.region}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{region.startups} Startups</span>
                          <Badge variant="outline" className="text-xs">
                            {region.percentage}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={region.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Regional Innovation Hubs
                </CardTitle>
                <CardDescription>
                  Key innovation centers in Ethiopia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4 mb-4">
                    <h4 className="font-semibold">Addis Ababa Technology Park</h4>
                    <p className="text-sm text-muted-foreground mt-2 mb-3">
                      Home to 128 tech startups with focus on software development and fintech innovations.
                    </p>
                    <div className="flex gap-2">
                      <Badge>Fintech Hub</Badge>
                      <Badge variant="outline">128 Companies</Badge>
                    </div>
                  </div>

                  <div className="border rounded-md p-4 mb-4">
                    <h4 className="font-semibold">Hawassa ICT Village</h4>
                    <p className="text-sm text-muted-foreground mt-2 mb-3">
                      Emerging tech cluster with 42 companies focused on agriculture technology and digital services.
                    </p>
                    <div className="flex gap-2">
                      <Badge>AgriTech Focus</Badge>
                      <Badge variant="outline">42 Companies</Badge>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h4 className="font-semibold">Bahir Dar Innovation Hub</h4>
                    <p className="text-sm text-muted-foreground mt-2 mb-3">
                      University-affiliated innovation center supporting 35 early-stage startups.
                    </p>
                    <div className="flex gap-2">
                      <Badge>University Linkage</Badge>
                      <Badge variant="outline">35 Startups</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funding" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Funding 2025</CardTitle>
                <CardDescription>Year to date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$42.1M</div>
                <p className="text-xs text-muted-foreground">
                  Projected to reach $58M by year end
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div className="text-sm text-green-700">18.9% increase from 2024</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Seed Round</CardTitle>
                <CardDescription>Early-stage funding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$280K</div>
                <p className="text-xs text-muted-foreground">
                  For pre-Series A startups
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div className="text-sm text-green-700">12.4% increase from 2024</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
                <CardDescription>In Ethiopian market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">
                  Including 12 international VCs
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div className="text-sm text-green-700">8 new investors in 2025</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                Funding Growth Trends
              </CardTitle>
              <CardDescription>
                Ethiopian startup funding 2022-2025
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="h-48 flex items-end gap-8 justify-between pt-6 pb-2">
                  {fundingTrends.map((item) => (
                    <div key={item.year} className="flex flex-col items-center gap-2">
                      <div className="text-sm font-medium">${item.amount}M</div>
                      <div className={`w-16 bg-primary/80 rounded-t-md ${item.projected ? 'bg-primary/30' : ''}`} style={{ height: `${(item.amount / 42.1) * 180}px` }}></div>
                      <div className="text-sm font-medium">{item.year}</div>
                      {item.projected && <Badge className="text-xs">Projected</Badge>}
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Key Funding Insights</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                      <p>Government initiatives account for 38% of total startup funding</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                      <p>International investment in Ethiopian startups has grown 24% in 2025</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                      <p>Average time from seed to Series A is 18 months for Ethiopian startups</p>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Funding Program Competition Analytics
              </CardTitle>
              <CardDescription>
                Application success rates for Ethiopian startup funding programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {competitionTrends.map(program => (
                  <div key={program.program} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{program.program}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {program.applicants} Applications • {program.awards} Awards
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {((program.awards / program.applicants) * 100).toFixed(1)}% Success Rate
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${(program.awards / program.applicants) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-muted/50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Funding Competition Insights</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                    <p>Applications with business model validation are 3.2x more likely to receive funding</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                    <p>Startups that have completed an accelerator program have a 24% higher success rate</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                    <p>Women-led startups receive 18% of total funding despite representing 27% of applications</p>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div>
        <h3 className="text-lg font-medium mb-4">Latest Market Insights</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {marketInsights.map(insight => (
            <Card key={insight.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="mb-2">
                    {insight.category}
                  </Badge>
                  <div className="text-xs text-muted-foreground">{insight.date}</div>
                </div>
                <CardTitle className="text-base">{insight.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="gap-1 w-full">
                  Read Full Report <ArrowUpRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
