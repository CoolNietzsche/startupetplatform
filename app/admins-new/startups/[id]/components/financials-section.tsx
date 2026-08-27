import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Users,
  BarChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type FinancialsSectionProps = {
  startup: any; // In a real app, we would define a proper type
};

export function FinancialsSection({ startup }: FinancialsSectionProps) {
  // Check if startup has financial data
  const hasFinancials = startup.financials && 
    (startup.financials.fundingRounds || 
    startup.financials.revenue || 
    startup.financials.projections);
  
  if (!hasFinancials) {
    return (
      <Card className="p-6 text-center">
        <div className="text-muted-foreground mb-3">
          <BarChart className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <h3 className="text-lg font-medium">No Financial Data</h3>
        </div>
        <p className="text-sm">
          Financial information has not been provided for this startup.
        </p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Funding overview */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {startup.financials.fundingTotal && (
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-sm text-muted-foreground">Total Funding Raised</div>
                <div className="text-3xl font-bold">{startup.financials.fundingTotal}</div>
              </div>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </div>
          )}
          
          {/* Funding Rounds */}
          {startup.financials.fundingRounds && startup.financials.fundingRounds.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Funding Rounds</h3>
              
              {startup.financials.fundingRounds.map((round: any, index: number) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Badge variant="outline" className="mb-1">{round.type}</Badge>
                      <div className="font-semibold">{round.amount}</div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {round.date}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Investors</div>
                    <div className="flex flex-wrap gap-1">
                      {round.investors && round.investors.map((investor: string, i: number) => (
                        <Badge key={i} variant="secondary" className="font-normal text-xs">
                          {investor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Revenue & Projections */}
      {(startup.financials.revenue || startup.financials.projections) && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue */}
              {startup.financials.revenue && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-primary" />
                    Revenue
                  </h3>
                  
                  <div className="space-y-4">
                    {Object.entries(startup.financials.revenue).map(([year, amount]) => (
                      <div key={year} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{year}</span>
                          <span className="text-sm">{amount}</span>
                        </div>
                        <Progress value={
                          // Calculate relative percentage based on the maximum revenue
                          Object.values(startup.financials.revenue).indexOf(amount) / 
                          (Object.values(startup.financials.revenue).length - 1) * 100
                        } className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Projections */}
              {startup.financials.projections && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-primary" />
                    Projections
                  </h3>
                  
                  <div className="space-y-4">
                    {Object.entries(startup.financials.projections).map(([year, amount]) => (
                      <div key={year} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{year}</span>
                          <span className="text-sm">{amount}</span>
                        </div>
                        <Progress value={
                          // Calculate relative percentage based on the maximum projection
                          Object.values(startup.financials.projections).indexOf(amount) / 
                          (Object.values(startup.financials.projections).length - 1) * 100
                        } className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Financial Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="border rounded-md p-3">
                <div className="text-xs text-muted-foreground">Burn Rate</div>
                <div className="text-lg font-semibold mt-1">$38.5K/mo</div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-xs text-muted-foreground">Runway</div>
                <div className="text-lg font-semibold mt-1">14 months</div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-xs text-muted-foreground">Unit Economics</div>
                <div className="text-lg font-semibold mt-1">+24% YoY</div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-xs text-muted-foreground">Customer LTV</div>
                <div className="text-lg font-semibold mt-1">$5,200</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Market Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Market Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground mb-1">Market Size</div>
                <div className="text-2xl font-bold">$280M</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total addressable market in Ethiopia
                </div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground mb-1">Growth Rate</div>
                <div className="text-2xl font-bold">18.5%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Compound annual growth rate
                </div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground mb-1">Market Share</div>
                <div className="text-2xl font-bold">4.2%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Current market penetration
                </div>
              </div>
            </div>
            
            {/* Market Opportunity */}
            <div className="border rounded-md p-4 mt-4">
              <h3 className="text-sm font-medium mb-2">Market Opportunity</h3>
              <p className="text-sm text-muted-foreground">
                The Ethiopian {startup.sector.toLowerCase()} sector is experiencing rapid growth 
                driven by increased technology adoption and government digitization initiatives. 
                {startup.name} is positioned to capitalize on this growth due to its localized 
                approach and strong understanding of the Ethiopian business environment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
