'use server'

import db from "@/lib/db";
import { ensureAuthenticated } from "@/lib/security";

// Types for ecosystem data
export interface StartupNews {
    id: string;
    title: string;
    description: string;
    source: string;
    url: string;
    imageUrl?: string;
    category: 'AFRICAN' | 'ETHIOPIAN' | 'GLOBAL';
    publishedAt: Date;
}

export interface FundingOpportunity {
    id: string;
    title: string;
    description: string;
    organization: string;
    amount?: string;
    deadline?: Date;
    eligibility: string[];
    applicationUrl: string;
    category: 'GRANT' | 'INVESTMENT' | 'ACCELERATOR';
    region: string[];
    sectors?: string[];
}

export interface EcosystemBuilder {
    id: string;
    name: string;
    logo?: string;
    category: 'INCUBATOR' | 'ACCELERATOR' | 'COWORKING' | 'INVESTOR' | 'GOVERNMENT' | 'EDUCATION' | 'COMMUNITY' | 'STARTUP';
    location: string;
    description: string;
    services: string[];
    contactEmail?: string;
    website: string;
    foundedYear?: number;
    focusSectors?: string[];
    successStories?: {
        startupName: string;
        description: string;
    }[];
    // Coworking space specific properties
    operatingHours?: string;
    membershipStatus?: string; 
    amenities?: string[];
    pricingPlans?: {
        name: string;
        price: string;
        billingCycle: string;
        description: string;
        features: string[];
        featured?: boolean;
    }[];
    spaces?: {
        id: string;
        name: string;
        description: string;
        capacity: number;
        available: boolean;
        pricePerDay?: string;
        pricePerHour?: string;
        pricePerMonth?: string;
        amenities?: string[];
        image?: string;
        type?: string; // Add type property to the space object
    }[];
    detailedLocation?: {
        address: string;
        city: string;
        directions?: string;
        googleMapsUrl?: string;
    };
    _fetchTime?: number;
}







// Fetch and parse news from various sources
async function fetchStartupNews(category: 'AFRICAN' | 'ETHIOPIAN' | 'GLOBAL'): Promise<StartupNews[]> {
    return [];
}

// Fetch funding opportunities - now returns real DB data
export async function getFundingOpportunities(): Promise<FundingOpportunity[]> {
    try {
        const opportunities = await db.fundingOpportunity.findMany({
            where: { isActive: true },
        });
        return opportunities as unknown as FundingOpportunity[];
    } catch (error) {
        console.error("Error fetching funding opportunities:", error);
        return [];
    }
}

// Fetch ecosystem builders - returns real certified startups from DB
export async function getEcosystemBuilders(): Promise<EcosystemBuilder[]> {
  try {
    const certifiedApps = await db.application.findMany({
      where: {
        status: "CERTIFIED",
      },
      include: {
        user: {
          select: {
            address: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return certifiedApps.map((app) => ({
      id: app.id,
      name: app.startupName || "Unnamed Startup",
      description: app.productDescription || app.vision || "Certified Ethiopian Startup",
      category: "STARTUP",
      location: app.user?.address || "Addis Ababa, Ethiopia",
      website: app.website || "#",
      services: [app.industry || "General"].filter(Boolean),
      focusSectors: [app.industry || "General"].filter(Boolean),
      logo: `https://avatar.vercel.sh/${app.id}.png`, // Fallback logo
    }));
  } catch (error) {
    console.error("Error fetching ecosystem builders:", error);
    return [];
  }
}

// Get ecosystem dashboard data
export async function getEcosystemData() {
    await ensureAuthenticated();
    const [africanNews, ethiopianNews, fundingOpps, ecosystemBuilders] = await Promise.all([
        fetchStartupNews('AFRICAN'),
        fetchStartupNews('ETHIOPIAN'),
        getFundingOpportunities(),
        getEcosystemBuilders(),
    ]);

    return {
        news: {
            african: africanNews,
            ethiopian: ethiopianNews,
        },
        fundingOpportunities: fundingOpps,
        ecosystemBuilders: ecosystemBuilders,
    };
}
