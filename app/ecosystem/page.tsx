import Link from "next/link";
import { getEcosystemBuilders } from "@/lib/actions/ecosystem";

export const dynamic = "force-dynamic";
import { PublicBuildersList } from './builders-list';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  GraduationCap, 
  Search, 
  Briefcase,
  HelpingHand,
  Landmark,
  Users
} from "lucide-react";

export const metadata = {
  title: 'Startup Ecosystem | Startup Ethiopia',
  description: 'Discover Ethiopia&apos;s startup ecosystem builders including incubators, accelerators, coworking spaces, and investors.',
};

export default async function EcosystemPage() {
  const builders = await getEcosystemBuilders();
  
  // Get featured builders (one of each category)
  const categoryMap: Record<string, any> = {
    'INCUBATOR': null,
    'ACCELERATOR': null,
    'COWORKING': null,
    'INVESTOR': null,
    'GOVERNMENT': null,
    'EDUCATION': null,
    'COMMUNITY': null
  };
  
  builders.forEach(builder => {
    if (categoryMap[builder.category] === null) {
      categoryMap[builder.category] = builder;
    }
  });
  
  const featuredBuilders = Object.values(categoryMap).filter(Boolean);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Search Section */}
      <div className="bg-gray-100 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-5xl font-bold mb-2">Discover</h1>
          <h2 className="text-4xl font-medium mb-6">Ethiopia&apos;s startup ecosystem</h2>
          <p className="text-lg text-gray-600 mb-8">
            Find the perfect incubator, accelerator, coworking space, or investor to help grow your startup.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-1 flex flex-col sm:flex-row gap-2 mb-8">
            <div className="flex-grow relative">
              <Input 
                type="text" 
                placeholder="What are you looking for? (e.g., incubator, investor)" 
                className="border-0 h-12 pl-10"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
            <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
              <Link href="/ecosystem/builders">Search</Link>
            </Button>
          </div>
          
          <div className="pt-4">
            <p className="text-gray-500 mb-4">Or browse by category</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/ecosystem/builders?category=INCUBATOR" className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow flex flex-col items-center">
                <div className="bg-blue-100 rounded-full p-3 mb-2">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-medium">Incubators</span>
              </Link>
              
              <Link href="/ecosystem/builders?category=ACCELERATOR" className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow flex flex-col items-center">
                <div className="bg-purple-100 rounded-full p-3 mb-2">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
                <span className="font-medium">Accelerators</span>
              </Link>
              
              <Link href="/ecosystem/builders?category=COWORKING" className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow flex flex-col items-center">
                <div className="bg-green-100 rounded-full p-3 mb-2">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <span className="font-medium">Coworking</span>
              </Link>
              
              <Link href="/ecosystem/builders?category=INVESTOR" className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow flex flex-col items-center">
                <div className="bg-amber-100 rounded-full p-3 mb-2">
                  <Landmark className="h-6 w-6 text-amber-600" />
                </div>
                <span className="font-medium">Investors</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Ecosystem Builders */}
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Popular Ecosystem Builders</h2>
          <div className="flex space-x-1">
            <Button variant="outline" size="sm" className="font-medium">All</Button>
            <Button variant="ghost" size="sm" className="text-gray-500">Incubators</Button>
            <Button variant="ghost" size="sm" className="text-gray-500">Accelerators</Button>
            <Button variant="ghost" size="sm" className="text-gray-500">Coworking</Button>
          </div>
        </div>
        
        <PublicBuildersList 
          initialBuilders={featuredBuilders}
          allSectors={[]}
          featuredOnly={true}
          showLogin={true}
        />
        
        <div className="text-center mt-10">
          <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
            <Link href="/ecosystem/builders">View All Ecosystem Builders</Link>
          </Button>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover</h3>
              <p className="text-gray-600">
                Browse our comprehensive directory of Ethiopian ecosystem builders to find the perfect match for your startup.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-gray-600">
                Create an account to apply to accelerator programs, request funding, or book coworking spaces directly.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-amber-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <HelpingHand className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Grow</h3>
              <p className="text-gray-600">
                Access resources, mentorship, and capital to take your startup to the next level in Ethiopia&apos;s growing tech ecosystem.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-green-700 text-white py-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to accelerate your startup?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join our platform to connect with Ethiopia&apos;s leading ecosystem builders and access exclusive opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-700" asChild>
              <Link href="/ecosystem/builders">Browse Directory</Link>
            </Button>
            <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100" asChild>
              <Link href="/auth/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
