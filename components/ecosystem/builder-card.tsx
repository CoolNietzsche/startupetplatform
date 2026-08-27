"use client";

import { EcosystemBuilder } from "@/lib/actions/ecosystem";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Calendar, Users, Coffee, Wifi, Zap, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface BuilderCardProps {
  builder: EcosystemBuilder;
}

export function BuilderCard({ builder }: BuilderCardProps) {
  // Determine if this is a coworking space
  const isCoworkingSpace = builder.category === "COWORKING";

  // Helper to get color based on category
  const getCategoryStyle = (category: string) => {
    const styleMap: Record<string, { bg: string, text: string, border: string }> = {
      'INCUBATOR': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      'ACCELERATOR': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      'COWORKING': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      'INVESTOR': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
      'GOVERNMENT': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      'EDUCATION': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
      'COMMUNITY': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    };
    return styleMap[category] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
  };

  // Get action button based on category
  const getActionButton = () => {
    if (isCoworkingSpace) {
      return (
        <Link href={`/dashboard/ecosystem/builders/${builder.id}?action=booking`} passHref>
          <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700">
            <Calendar className="h-3 w-3 mr-1" />
            Book Space
          </Button>
        </Link>
      );
    }

    const getButtonStyle = () => {
      switch (builder.category) {
        case 'INCUBATOR':
        case 'ACCELERATOR':
          return "bg-blue-600 hover:bg-blue-700";
        case 'INVESTOR':
          return "bg-amber-600 hover:bg-amber-700";
        default:
          return "bg-primary hover:bg-primary/90";
      }
    };

    const getButtonText = () => {
      switch (builder.category) {
        case 'INCUBATOR':
        case 'ACCELERATOR':
          return "Apply to Program";
        case 'INVESTOR':
          return "Request Funding";
        case 'GOVERNMENT':
          return "Apply Now";
        case 'EDUCATION':
          return "Apply Now";
        default:
          return "Apply";
      }
    };

    // Only show apply button for relevant categories
    if (['INCUBATOR', 'ACCELERATOR', 'INVESTOR', 'GOVERNMENT', 'EDUCATION'].includes(builder.category)) {
      return (
        <Link href={`/dashboard/ecosystem/builders/${builder.id}?action=apply`} passHref>
          <Button size="sm" className={`text-xs ${getButtonStyle()}`}>
            <Users className="h-3 w-3 mr-1" />
            {getButtonText()}
          </Button>
        </Link>
      );
    }

    return null;
  };

  // Format category for display
  const formatCategory = (category: string) => {
    return category.charAt(0) + category.slice(1).toLowerCase();
  };

  // Helper to get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('internet') || amenityLower.includes('wifi'))
      return <Wifi className="h-4 w-4" aria-hidden="true" />;
    if (amenityLower.includes('coffee') || amenityLower.includes('café'))
      return <Coffee className="h-4 w-4" aria-hidden="true" />;
    if (amenityLower.includes('meeting') || amenityLower.includes('conference'))
      return <Users className="h-4 w-4" aria-hidden="true" />;
    if (amenityLower.includes('24/7') || amenityLower.includes('access') || amenityLower.includes('hour'))
      return <Clock className="h-4 w-4" aria-hidden="true" />;
    if (amenityLower.includes('printing') || amenityLower.includes('printer'))
      return <Zap className="h-4 w-4" aria-hidden="true" />;
    return <CheckCircle2 className="h-4 w-4" aria-hidden="true" />;
  };

  const colors = getCategoryStyle(builder.category);

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <Badge className={`${colors.bg} ${colors.text} self-start mb-2`}>
          {formatCategory(builder.category)}
        </Badge>
        <CardTitle className="text-xl">{builder.name}</CardTitle>
        <CardDescription className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          {builder.location}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {builder.description}
        </p>

        {builder.focusSectors && builder.focusSectors.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-1">Focus Sectors</h4>
            <div className="flex flex-wrap gap-1">
              {builder.focusSectors.slice(0, 3).map((sector) => (
                <Badge key={sector} variant="outline" className="text-xs">
                  {sector}
                </Badge>
              ))}
              {builder.focusSectors.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{builder.focusSectors.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Amenities section for coworking spaces */}
        {isCoworkingSpace && builder.amenities && builder.amenities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Amenities</h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-1">
              {builder.amenities.slice(0, 6).map((amenity) => (
                <div key={amenity} className="flex items-center text-xs text-gray-600">
                  {getAmenityIcon(amenity)}
                  <span className="ml-1 truncate">{amenity}</span>
                </div>
              ))}
              {builder.amenities.length > 6 && (
                <div className="flex items-center text-xs text-gray-600">
                  <span className="ml-1">+{builder.amenities.length - 6} more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing info for coworking spaces */}
        {isCoworkingSpace && builder.pricingPlans && builder.pricingPlans.length > 0 && (
          <div className="mt-2 mb-4">
            <h4 className="text-sm font-medium mb-1">Pricing starts at</h4>
            <p className="text-base font-medium text-green-700">
              {builder.pricingPlans[0].price} Birr
              <span className="text-xs text-gray-500 ml-1">
                / {builder.pricingPlans[0].billingCycle}
              </span>
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-2 border-t">
        <Link href={`/dashboard/ecosystem/builders/${builder.id}`} passHref>
          <Button variant="outline" size="sm" className="text-xs">
            View Details
          </Button>
        </Link>

        {getActionButton()}

        {builder.website && (
          <a
            href={builder.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            Website
          </a>
        )}
      </CardFooter>
    </Card>
  );
}
