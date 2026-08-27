import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = await rateLimit(`tin-verify:${session.user.id}`, 20, 3600);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const tin = searchParams.get('tin');

  if (!tin) {
    return NextResponse.json(
      { error: 'TIN number is required' },
      { status: 400 }
    );
  }

  try {
    // Make the actual HTTP request to etrade.gov.et
    const response = await fetch(`https://etrade.gov.et/business-license-checker?tin=${tin}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // Add a timeout to prevent hanging
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from etrade.gov.et: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML response
    const $ = cheerio.load(html);
    
    // Initialize data object
    const data: Record<string, string> = {};
    
    // Based on the actual HTML structure provided by the user
    // Each business field is in a div with a paragraph containing the label and a span containing the value
    
    // Find all divs that have the specific classes for business info
    const businessInfoDivs = $('div.flex.flex-col.items-start, div.flex.flex-col.items-start.justify-between');
    
    // Iterate through each div to extract the label and value
    businessInfoDivs.each((i, element) => {
      const labelElement = $(element).find('p.text-sm.text-teal-800.font-bold');
      const valueElement = $(element).find('span');
      
      const label = labelElement.text().trim();
      const value = valueElement.text().trim();
      
      // Map the extracted labels to our standardized field names
      if (label.toLowerCase().includes('registered no')) {
        data.registrationNumber = value;
      } else if (label.toLowerCase().includes('tin')) {
        data.tinNumber = value;
      } else if (label.toLowerCase().includes('business') && label.toLowerCase().includes('english')) {
        data.businessName = value;
      } else if (label.toLowerCase().includes('business') && !label.toLowerCase().includes('english')) {
        data.businessNameLocal = value;
      } else if (label.toLowerCase().includes('capital')) {
        data.capital = value;
      } else if (label.toLowerCase().includes('registered date')) {
        data.foundingDate = value;
      }
    });
    
    // Additional fields we need to infer or populate with defaults
    if (data.businessName) {
      // Try to determine industry from business name (very basic inference)
      if (data.businessName.toLowerCase().includes('tech') || 
          data.businessName.toLowerCase().includes('software') || 
          data.businessName.toLowerCase().includes('digital')) {
        data.industry = 'technology';
      } else if (data.businessName.toLowerCase().includes('farm') || 
                data.businessName.toLowerCase().includes('agri')) {
        data.industry = 'agriculture';
      } else {
        data.industry = 'other';
      }
      
      // Set default number of employees
      data.employeeCount = '10';
    }
    
    // Check if we successfully extracted the business name
    if (!data.businessName) {
      return NextResponse.json(
        { 
          success: false,
          error: 'TIN number not found or business information could not be retrieved'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data,
      source: 'etrade-api'
    });
    
  } catch (error: any) {
    console.error('Error verifying TIN:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify TIN number' },
      { status: 500 }
    );
  }
}
