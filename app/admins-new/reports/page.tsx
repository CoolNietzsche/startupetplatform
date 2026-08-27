"use client";

import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  PieChart, 
  LineChart, 
  Download, 
  Calendar, 
  Filter,
  FileText,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { generateCSV } from "@/lib/export";
import { getAdminReportsData, generateReportPdf, AdminReportsData } from './actions';
import { toast } from "sonner";

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('2025');
  const [reportType, setReportType] = useState('ecosystem');
  const [data, setData] = useState<AdminReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAdminReportsData(timeRange)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [timeRange]);

  const sectorGrowth = data?.sectorGrowth ?? {};
  const fundingData = data?.fundingData ?? {};
  const startupPerformance = data?.startupPerformance ?? {};
  const regionalImpact = data?.regionalImpact ?? {};
  const fundingTimeline = data?.fundingTimeline ?? [];

  const handleExport = (type: string) => {
    switch (type) {
      case "sector": {
        const sectorRows = Object.entries(sectorGrowth).map(([sector, vals]) => ({
          Sector: sector,
          Q1: vals.q1,
          Q2: vals.q2,
          Q3: vals.q3,
          Q4: vals.q4,
        }));
        const csv = generateCSV({ filename: `sector-report-${timeRange}.csv`, headers: ["Sector", "Q1", "Q2", "Q3", "Q4"], rows: sectorRows });
        downloadCSV(csv, `sector-report-${timeRange}.csv`);
        break;
      }
      case "funding": {
        const fundingRows = Object.entries(fundingData).map(([source, amount]) => ({
          Source: source,
          Amount: amount,
        }));
        const csv = generateCSV({ filename: `funding-data-${timeRange}.csv`, headers: ["Source", "Amount"], rows: fundingRows });
        downloadCSV(csv, `funding-data-${timeRange}.csv`);
        break;
      }
      case "regional": {
        const regionRows = Object.entries(regionalImpact).map(([region, d]) => ({
          Region: region,
          Startups: d.startups,
          Jobs: d.jobs,
          Investment: d.investment,
        }));
        const csv = generateCSV({ filename: `regional-impact-${timeRange}.csv`, headers: ["Region", "Startups", "Jobs", "Investment"], rows: regionRows });
        downloadCSV(csv, `regional-impact-${timeRange}.csv`);
        break;
      }
      case "timeline": {
        const timelineRows = fundingTimeline.map((t) => ({
          Quarter: t.quarter,
          Amount: t.amount,
          Rounds: t.rounds,
        }));
        const csv = generateCSV({ filename: `funding-timeline-${timeRange}.csv`, headers: ["Quarter", "Amount", "Rounds"], rows: timelineRows });
        downloadCSV(csv, `funding-timeline-${timeRange}.csv`);
        break;
      }
    }
  };

  const handlePdfExport = async () => {
    try {
      const result = await generateReportPdf(timeRange);
      const byteArray = Uint8Array.from(atob(result.pdf), c => c.charCodeAt(0));
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF report");
    }
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate detailed reports on the Ethiopian startup ecosystem</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading reports data...</p>
        </div>
      ) : (
      <div className="mb-6">
        <Tabs value={reportType} className="w-full" onValueChange={setReportType}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="ecosystem">Ecosystem Overview</TabsTrigger>
            <TabsTrigger value="sector">Sector Analysis</TabsTrigger>
            <TabsTrigger value="funding">Funding Metrics</TabsTrigger>
            <TabsTrigger value="regional">Regional Impact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ecosystem" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Startup Growth Trajectory</CardTitle>
                  <CardDescription>Registration of new startups by quarter in {timeRange}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] pt-4">
                  {Object.keys(sectorGrowth).length > 0 ? (
                  <div className="w-full h-full flex items-end gap-8 px-8">
                    {Object.entries(sectorGrowth).map(([sector, data]) => (
                      <div key={sector} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex items-end h-[220px] gap-2">
                          {Object.entries(data).map(([quarter, value]) => {
                            const maxVal = Math.max(...Object.values(data));
                            return (
                            <div 
                              key={quarter} 
                              className="flex-1 bg-primary/80 hover:bg-primary transition-colors rounded-t-sm relative group"
                              style={{ height: `${(value / (maxVal || 1)) * 100}%` }}
                            >
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {value} startups
                              </div>
                            </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground truncate w-full text-center">
                          {sector}
                        </p>
                      </div>
                    ))}
                  </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key indicators for the ecosystem</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(startupPerformance).map(([metric, value]) => (
                      <div key={metric} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{metric}</span>
                          <span className="font-medium">
                            {typeof value === 'number' ? 
                              (metric.includes('Rate') ? `${value}%` : value) 
                              : value}
                          </span>
                        </div>
                        <Progress 
                          value={typeof value === 'number' ? (value > 100 ? 100 : value) : 50} 
                          max={100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Funding Distribution</CardTitle>
                <CardDescription>Total funding received by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(fundingData).map(([type, amount]) => (
                    <div key={type} className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-8 border-primary/20 flex items-center justify-center">
                        <div 
                          className="w-full h-full rounded-full bg-primary/80 flex items-center justify-center text-white font-medium"
                          style={{ 
                            transform: `scale(${Math.sqrt(amount / Math.max(...Object.values(fundingData), 1))})` 
                          }}
                        >
                          {Math.round(amount / 1000000)}M
                        </div>
                      </div>
                      <p className="mt-2 text-sm font-medium">{type}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sector" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sector Performance Analysis</CardTitle>
                <CardDescription>Detailed breakdown by industry sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(sectorGrowth).slice(0, 5).map(([sector, vals]) => {
                      const totalStartups = Object.values(vals).reduce((s, v) => s + v, 0);
                      const totalFunding = Object.values(fundingData).reduce((s, v) => s + v, 0);
                      return (
                      <AccordionItem key={sector} value={sector}>
                        <AccordionTrigger>{sector}</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-3 gap-4 mt-2">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Startups: {totalStartups}</p>
                              <p className="text-sm font-medium">Jobs Created: {Math.round(totalStartups * 12)}</p>
                              <p className="text-sm font-medium">Avg. Revenue: {Math.round(totalFunding / (totalStartups || 1) / 1000000 * 10) / 10}M ETB</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Funding Raised: {Math.round(totalFunding / 1000000 * 10) / 10}M ETB</p>
                              <p className="text-sm font-medium">Certified: {Math.round((Object.values(vals).filter(v => v > 0).length / 4) * 100)}%</p>
                              <p className="text-sm font-medium">International: {Math.round(totalStartups * 0.08)} startups</p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Growth Rate: {Math.round((Object.values(vals)[3] || 0) / (Object.values(vals)[0] || 1) * 100)}%</p>
                              <p className="text-sm font-medium">Top Region: Addis Ababa</p>
                              <p className="text-sm font-medium">Avg. Team Size: 12 people</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => handleExport("sector")}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Sector Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="funding" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Funding Sources</CardTitle>
                  <CardDescription>Distribution by funding type</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <div className="h-full flex items-center justify-center">
                    <div className="relative w-64 h-64 rounded-full border-8 border-primary/10 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                        {Math.round(Object.values(fundingData).reduce((s, v) => s + v, 0) / 1000000)}M ETB
                      </div>
                      {Object.entries(fundingData).length > 0 && (
                        <>
                      <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)' }}>
                        <div className="w-full h-full bg-blue-500 opacity-80"></div>
                      </div>
                      <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 0% 100%)' }}>
                        <div className="w-full h-full bg-green-500 opacity-80"></div>
                      </div>
                      <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 50%, 0% 100%, 0% 0%, 50% 0%)' }}>
                        <div className="w-full h-full bg-amber-500 opacity-80"></div>
                      </div>
                      </>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {Object.entries(fundingData).slice(0, 3).map(([label], i) => {
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-amber-500'];
                      return (
                      <div key={label} className="flex items-center text-xs">
                        <div className={`w-3 h-3 ${colors[i] || 'bg-gray-500'} mr-2`}></div>
                        <span>{label}</span>
                      </div>
                      );
                    })}
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Funding Allocation</CardTitle>
                  <CardDescription>How funds are being utilized</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Infrastructure & Equipment</span>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Product Development</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <Progress value={28} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Human Resources</span>
                      <span className="text-sm font-medium">18%</span>
                    </div>
                    <Progress value={18} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Marketing & Sales</span>
                      <span className="text-sm font-medium">12%</span>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Research & Innovation</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Funding Timeline</CardTitle>
                <CardDescription>Major funding rounds in {timeRange}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative py-6">
                  <div className="absolute top-8 left-0 right-0 h-1 bg-primary/20"></div>
                  <div className="grid grid-cols-4 gap-4">
                    {fundingTimeline.map((item) => (
                      <div key={item.quarter} className="flex flex-col items-center relative">
                        <div className="absolute top-0 w-4 h-4 rounded-full bg-primary" style={{ top: '0.125rem' }}></div>
                        <div className="mt-6 text-center">
                          <p className="font-medium">{item.quarter} {timeRange}</p>
                          <p className="text-sm text-muted-foreground">{Math.round(item.amount / 1000000 * 10) / 10}M ETB</p>
                          <p className="text-xs">{item.rounds} funding rounds</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => handleExport("funding")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  View All Funding Events
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="regional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Regional Impact Assessment</CardTitle>
                <CardDescription>Startup ecosystem development by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(regionalImpact).map(([region, data]) => (
                    <div key={region} className="pb-4 border-b last:border-0">
                      <h3 className="text-lg font-medium mb-2">{region}</h3>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="bg-primary/5 rounded-lg p-4 text-center">
                          <p className="text-3xl font-bold">{data.startups}</p>
                          <p className="text-xs text-muted-foreground mt-1">Registered Startups</p>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-4 text-center">
                          <p className="text-3xl font-bold">{data.jobs}</p>
                          <p className="text-xs text-muted-foreground mt-1">Jobs Created</p>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-4 text-center">
                          <p className="text-3xl font-bold">{data.investment}</p>
                          <p className="text-xs text-muted-foreground mt-1">Total Investment</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Export & Share</CardTitle>
          <CardDescription>Download or share these reports with stakeholders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col h-auto py-4" onClick={handlePdfExport}>
              <Download className="h-6 w-6 mb-2" />
              <span className="text-sm">PDF Report</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => handleExport("timeline")}>
              <Download className="h-6 w-6 mb-2" />
              <span className="text-sm">Excel Data</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-4">
              <Mail className="h-6 w-6 mb-2" />
              <span className="text-sm">Email Report</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-4">
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-sm">Schedule</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Reports are generated based on data collected by the Ministry of Innovation & Technology.
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
