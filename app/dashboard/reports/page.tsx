"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart3, Calendar, CheckCircle, Clock, FileText, FilePlus, PenLine, PieChart, Upload } from "lucide-react";
import React, { useEffect, useState, Suspense } from "react";
import { getDashboardReportsData, PendingReport, SubmittedReport } from "./actions";

function ReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [submittedReports, setSubmittedReports] = useState<SubmittedReport[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getDashboardReportsData()
      .then((data) => {
        setPendingReports(data.pendingReports);
        setSubmittedReports(data.submittedReports);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  
  useEffect(() => {
    if (searchParams?.get("success") === "true") {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Progress Tracking</h1>
          <p className="text-gray-500 mt-1">Monitor and submit your program activity reports</p>
        </div>
        <Button 
          variant="default"
          className="md:self-start"
          onClick={() => router.push("/dashboard/reports/submit")}
        >
          <FilePlus className="mr-2 h-4 w-4" />
          Submit New Report
        </Button>
      </div>
      
      {showSuccess && (
        <Alert className="bg-gray-50 border mb-8">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Report Submitted Successfully</AlertTitle>
          <AlertDescription className="text-gray-700">
            Your report has been submitted and is now pending review. You&apos;ll receive feedback once it&apos;s processed.
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading reports...</p>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="border bg-gray-50 rounded-md p-6 transition-shadow hover:shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 rounded-full p-3">
              <Clock className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-medium text-lg">Due Reports</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-800">{pendingReports.length}</span>
                <span className="text-gray-600 text-sm">reports pending submission</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border bg-gray-50 rounded-md p-6 transition-shadow hover:shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 rounded-full p-3">
              <Upload className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-medium text-lg">Submitted</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-800">{submittedReports.length}</span>
                <span className="text-gray-600 text-sm">reports submitted this quarter</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border bg-gray-50 rounded-md p-6 transition-shadow hover:shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 rounded-full p-3">
              <CheckCircle className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-medium text-lg">Approved</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-800">
                  {submittedReports.filter(r => r.status === "Approved").length}
                </span>
                <span className="text-gray-600 text-sm">reports approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-bold">Upcoming Reports Due</h2>
          </div>
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-3 py-1">
            {pendingReports.length} Due Reports
          </Badge>
        </div>
        
        <div className="overflow-hidden border rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-700 sm:pl-6">Program</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700">Report Type</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700">Due Date</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700">Requirements</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {pendingReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">No pending reports due</td>
                </tr>
              ) : (
              pendingReports.map((report) => (
                <tr key={report.id}>
                  <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-gray-900">{report.programName}</div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-600">
                    <Badge variant="outline">{report.reportType}</Badge>
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                      <span>{report.dueDate}</span>
                    </div>
                    <Badge className={`mt-1 ${
                      report.daysLeft <= 5 ? "border border-gray-200 font-medium" : 
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {report.daysLeft} days left
                    </Badge>
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <div className="flex flex-wrap gap-1.5">
                      {report.requirements.map((req, i) => (
                        <Badge key={i} variant="secondary" className="bg-gray-100">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-right">
                    <Button 
                      onClick={() => router.push(`/dashboard/reports/submit?program=${encodeURIComponent(report.programName)}&type=${encodeURIComponent(report.reportType)}`)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Submit
                    </Button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </section>
      
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-bold">Recent Submissions</h2>
          </div>
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-3 py-1">
            {submittedReports.length} Reports
          </Badge>
        </div>
        
        <div className="space-y-4">
          {submittedReports.length === 0 ? (
            <div className="border rounded-md p-8 text-center text-sm text-gray-500">No submitted reports yet</div>
          ) : (
          submittedReports.map((report) => (
            <div key={report.id} className="border rounded-md overflow-hidden hover:shadow-sm transition-shadow">
              <div className={`h-1 ${
                report.status === "Approved" ? "bg-gray-500" : 
                report.status === "Under Review" ? "bg-gray-400" : 
                "bg-gray-300"
              }`}></div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{report.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                      <span className="text-gray-700">{report.programName}</span>
                      <Badge variant="outline">{report.reportType}</Badge>
                      <div className="flex items-center">
                        <Upload className="h-3.5 w-3.5 mr-1.5" />
                        <span>Submitted: {report.submittedDate}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Badge className={`
                        ${report.status === "Approved" ? "bg-gray-200 text-gray-800" : 
                          report.status === "Under Review" ? "bg-gray-100 text-gray-800" : 
                          "border border-gray-200 text-gray-800"}
                      `}>
                        {report.status}
                      </Badge>
                    </div>
                    
                    {report.feedback && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-md text-sm">
                        <p className="font-medium mb-1">Feedback:</p>
                        <p className="text-gray-600">{report.feedback}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 md:min-w-32">
                    <Button variant="outline" className="w-full md:w-auto">
                      <FileText className="mr-2 h-4 w-4" />
                      View Report
                    </Button>
                    {report.status === "Needs Revision" && (
                      <Button variant="secondary" className="w-full md:w-auto">
                        <PenLine className="mr-2 h-4 w-4" />
                        Submit Revision
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )))}
        </div>
      </section>
      
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-bold">Program Metrics</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border rounded-md overflow-hidden hover:shadow-sm transition-shadow">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="font-semibold">Impact Distribution</h3>
              <p className="text-sm text-gray-500">Breakdown of your reported impact metrics</p>
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <PieChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Progress impact visualization</p>
                <p className="text-xs text-gray-400 mt-2">Customer Acquisition (40%), Revenue Growth (30%), Jobs Created (20%), Other (10%)</p>
              </div>
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden hover:shadow-sm transition-shadow">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="font-semibold">Milestone Completion</h3>
              <p className="text-sm text-gray-500">Progress across your active programs</p>
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Milestone progression visualization</p>
                <p className="text-xs text-gray-400 mt-2">AgriTech Challenge (65%), Digital Growth Fund (42%), Women in Tech (90%)</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      </>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div>Loading reports...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
