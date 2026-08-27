import { getEcosystemBuilders } from "@/lib/actions/ecosystem";

export const dynamic = "force-dynamic";
import { PublicBuildersList } from '../builders-list';
import { 
  Building2,
  MapPin,
  Users,
  SlidersHorizontal
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: 'Ecosystem Builders Directory | Startup Ethiopia',
  description: 'Browse the complete directory of incubators, accelerators, coworking spaces, investors and other organizations supporting Ethiopia&apos;s startup ecosystem.',
};

export default async function PublicBuildersPage() {
  const builders = await getEcosystemBuilders();
  
  // Get all unique sectors from the builders
  const allSectors = Array.from(new Set(
    builders.flatMap(builder => builder.focusSectors || [])
  )).sort();

  // Get counts by category
  const categoryCounts = builders.reduce((counts, builder) => {
    counts[builder.category] = (counts[builder.category] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-green-800 text-white py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center mb-4">
            <Link href="/ecosystem" className="text-white/80 hover:text-white text-sm flex items-center">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white p-0 mr-2">
                ← Back
              </Button>
              Ecosystem Home
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-4">Ecosystem Builders Directory</h1>
          <p className="text-xl text-white/80 max-w-2xl mb-8">
            Discover and connect with the organizations shaping Ethiopia&apos;s startup ecosystem
          </p>
          
          {/* Stats Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{builders.length}</div>
              <div className="text-sm text-white/80">Total Organizations</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{categoryCounts.INCUBATOR || 0}</div>
              <div className="text-sm text-white/80">Incubators</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{categoryCounts.ACCELERATOR || 0}</div>
              <div className="text-sm text-white/80">Accelerators</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{categoryCounts.COWORKING || 0}</div>
              <div className="text-sm text-white/80">Coworking Spaces</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Directory Highlights */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="flex items-center text-gray-600">
              <Building2 className="h-5 w-5 mr-2 text-blue-600" />
              <span>Coworking spaces with flexible options</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
              <span>Located across Ethiopia</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              <span>Programs for early to growth stage startups</span>
            </div>
            <div className="flex items-center text-gray-600">
              <SlidersHorizontal className="h-5 w-5 mr-2 text-amber-600" />
              <span>Filter by sector and specialization</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Directory */}
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Full Directory</h2>
          <p className="text-gray-600">
            Browse our comprehensive listing of ecosystem builders supporting startups across Ethiopia.
            Use the filters to find the perfect match for your needs.
          </p>
        </div>
        
        <PublicBuildersList 
          initialBuilders={builders} 
          allSectors={allSectors} 
          showLogin={true}
        />
      </div>
      
      {/* CTA Section */}
      <div className="bg-gray-100 border-t py-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-2xl font-bold mb-3">Need Help Finding the Right Support?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our team can help match you with the right ecosystem builders based on your startup&apos;s specific needs and stage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Get Personalized Recommendations
            </Button>
            <Button variant="outline" size="lg">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
