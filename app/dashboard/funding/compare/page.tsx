"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Info, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import styles from "./page.module.css";

// Comparison criteria categories
const comparisonCategories = [
  { id: "basics", label: "Basics", fields: ["title", "category", "status", "daysLeft", "provider"] },
  { id: "funding", label: "Funding Details", fields: ["amountMin", "amountMax", "fundingType", "equityRequired", "repaymentTerms", "disbursementSchedule"] },
  { id: "eligibility", label: "Eligibility & Process", fields: ["eligibility", "applicationProcess", "timeToDecision", "successRate"] },
  { id: "requirements", label: "Requirements", fields: ["reportingRequirements", "documentation"] },
  { id: "support", label: "Support Services", fields: ["supportServices"] }
];

// Format field value for display
const formatFieldValue = (field: string, value: any): JSX.Element | string => {
  switch (field) {
    case "status":
      return (
        <Badge className={
          value === "Active" ? styles.active : 
          value === "Coming Soon" ? styles.comingSoon :
          styles.pending
        }>
          {value}
        </Badge>
      );
    case "daysLeft":
      return `${value} days`;
    case "amountMin":
    case "amountMax":
      return `$${value.toLocaleString()}`;
    case "eligibility":
    case "documentation":
    case "supportServices":
    case "sectors":
      return (
        <ul className={styles.list}>
          {Array.isArray(value) ? value.map((item, i) => (
            <li key={i} className={styles.listItem}>{item}</li>
          )) : value}
        </ul>
      );
    case "equityRequired":
      return value === "No" ? 
        <span className={styles.noEquity}><Check className="h-4 w-4 mr-1" /> No equity required</span> : 
        <span>{value}</span>;
    case "successRate":
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className={styles.successRateContainer}>
                <div className="w-24 h-2 bg-gray-200 rounded-full">
                  <div
                    className={styles.successRateBar}
                    style={{ '--bar-width': value } as React.CSSProperties}
                  ></div>
                </div>
                <span className={styles.successRateValue}>{value}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className={styles.tooltipText}>Percentage of applicants who received funding in previous rounds</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    default:
      return value;
  }
};

// Get field label
const getFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    title: "Program Name",
    category: "Category",
    status: "Status",
    daysLeft: "Application Deadline",
    provider: "Provider",
    amountMin: "Minimum Amount",
    amountMax: "Maximum Amount",
    fundingType: "Funding Type",
    equityRequired: "Equity Required",
    repaymentTerms: "Repayment Terms",
    disbursementSchedule: "Disbursement",
    eligibility: "Eligibility Criteria",
    applicationProcess: "Application Process",
    timeToDecision: "Time to Decision",
    successRate: "Success Rate",
    reportingRequirements: "Reporting",
    documentation: "Required Documents",
    supportServices: "Support Services",
    sectors: "Sectors"
  };
  
  return labels[field] || field;
};

export default function CompareFundingPage() {
  const [fundingOpportunities, setFundingOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);
  const [comparedOpportunities, setComparedOpportunities] = useState<any[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>(["basics", "funding"]);
  
  useEffect(() => {
    fetchFunding();
  }, []);

  const fetchFunding = async () => {
    try {
      const res = await fetch("/api/funding");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setFundingOpportunities(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch funding opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize with first two opportunities when data loads
  useEffect(() => {
    if (fundingOpportunities.length >= 2 && selectedOpportunities.length === 0) {
      setSelectedOpportunities([fundingOpportunities[0].id, fundingOpportunities[1].id]);
    }
  }, [fundingOpportunities.length, selectedOpportunities.length]);
  
  // Update compared opportunities when selection changes
  useEffect(() => {
    const opportunities = fundingOpportunities.filter(opp => 
      selectedOpportunities.includes(opp.id)
    );
    setComparedOpportunities(opportunities);
  }, [selectedOpportunities]);
  
  const handleAddOpportunity = () => {
    // Find the first opportunity not already selected
    const availableOpportunity = fundingOpportunities.find(opp => 
      !selectedOpportunities.includes(opp.id)
    );
    
    if (availableOpportunity) {
      setSelectedOpportunities([...selectedOpportunities, availableOpportunity.id]);
    }
  };
  
  const handleRemoveOpportunity = (id: string) => {
    setSelectedOpportunities(selectedOpportunities.filter(oppId => oppId !== id));
  };
  
  const handleChangeOpportunity = (index: number, newId: string) => {
    const newSelectedOpportunities = [...selectedOpportunities];
    newSelectedOpportunities[index] = newId;
    setSelectedOpportunities(newSelectedOpportunities);
  };
  
  const toggleCategory = (categoryId: string) => {
    if (activeCategories.includes(categoryId)) {
      setActiveCategories(activeCategories.filter(id => id !== categoryId));
    } else {
      setActiveCategories([...activeCategories, categoryId]);
    }
  };
  
  return (
    <div className={styles.container}>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Loading funding opportunities...</p>
        </div>
      ) : (
      <>
      <div className={styles.header}>
        <div className={styles.backButton}>
          <Button 
            variant="outline" 
            size="icon" 
            asChild
          >
            <Link href="/dashboard/funding">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <h1 className={styles.title}>Compare Funding Opportunities</h1>
        <Button
          variant="outline"
          onClick={handleAddOpportunity}
          disabled={selectedOpportunities.length >= fundingOpportunities.length}
          className={styles.addButton}
        >
          <Plus className="h-4 w-4" />
          <span>Add to Compare</span>
        </Button>
      </div>
      
      <div className={styles.infoBox}>
        <p className={styles.infoText}>
          Compare different funding opportunities side by side to find the best match for your startup.
          Select the categories that matter most to you, and add or remove opportunities to customize your comparison.
        </p>
      </div>
      
      {/* Comparison table */}
      <Card>
        <CardHeader className={styles.cardHeader}>
          <CardTitle>Funding Comparison</CardTitle>
          <CardDescription>Compare up to 4 funding opportunities side by side</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Comparison selectors */}
          <div className={styles.selectors}>
            {selectedOpportunities.map((opportunityId, index) => (
              <div key={index} className={styles.selector}>
                <Select
                  value={opportunityId}
                  onValueChange={(value) => handleChangeOpportunity(index, value)}
                >
                  <SelectTrigger className={styles.selectorTrigger}>
                    <SelectValue placeholder="Select a funding opportunity" />
                  </SelectTrigger>
                  <SelectContent>
                    {fundingOpportunities.map((opp) => (
                      <SelectItem 
                        key={opp.id} 
                        value={opp.id}
                        disabled={selectedOpportunities.includes(opp.id) && opp.id !== opportunityId}
                      >
                        {opp.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedOpportunities.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={styles.removeButton}
                    onClick={() => handleRemoveOpportunity(opportunityId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            
            {selectedOpportunities.length < 4 && selectedOpportunities.length < fundingOpportunities.length && (
              <Button
                variant="outline"
                className={styles.addButton}
                onClick={handleAddOpportunity}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another
              </Button>
            )}
          </div>
          
          {/* Category toggles */}
          <div className={styles.categoryToggles}>
            {comparisonCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategories.includes(category.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCategory(category.id)}
                className={activeCategories.includes(category.id) ? styles.activeCategory : ""}
              >
                {category.label}
              </Button>
            ))}
          </div>
          
          {/* Comparison table */}
          <div className={styles.tableContainer}>
            <Table>
              <TableHeader>
                <TableRow className={styles.tableHeader}>
                  <TableHead className={styles.criteriaHeader}>Criteria</TableHead>
                  {comparedOpportunities.map((opportunity) => (
                    <TableHead key={opportunity.id} className={styles.opportunityHeader}>
                      <div className={styles.opportunityTitle}>{opportunity.title}</div>
                      <div className={styles.opportunityProvider}>{opportunity.provider}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonCategories
                  .filter(category => activeCategories.includes(category.id))
                  .map((category) => (
                    <React.Fragment key={category.id}>
                      <TableRow className={styles.categoryRow}>
                        <TableCell colSpan={comparedOpportunities.length + 1} className={styles.categoryHeader}>
                          <div className={styles.categoryTitle}>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            {category.label}
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {category.fields.map((field) => (
                        <TableRow key={field}>
                          <TableCell className={styles.criteriaCell}>
                            <div className={styles.criteriaTitle}>
                              {getFieldLabel(field)}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className={styles.tooltipText}>Information about {getFieldLabel(field).toLowerCase()}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          
                          {comparedOpportunities.map((opportunity) => (
                            <TableCell key={`${opportunity.id}-${field}`} className={styles.valueCell}>
                              {opportunity[field] ? (
                                formatFieldValue(field, opportunity[field])
                              ) : (
                                <span className={styles.noValue}><Minus className="h-4 w-4" /></span>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className={styles.cardFooter}>
          <Button asChild variant="outline">
            <Link href="/dashboard/funding">
              Back to Funding Opportunities
            </Link>
          </Button>
          
          <Button asChild>
            <Link href="/dashboard/funding/my-applications">
              View My Applications
            </Link>
          </Button>
        </CardFooter>
      </Card>
      </>
      )}
    </div>
  );
}
