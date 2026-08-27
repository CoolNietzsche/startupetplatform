import { getEcosystemBuilders } from "@/lib/actions/ecosystem";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Mail, 
  MapPin, 
  ArrowLeft, 
  Building, 
  ChevronRight, 
  Wifi, 
  Coffee, 
  Users, 
  Zap, 
  CheckCircle,
  Share2,
  Bookmark,
  Star,
  Clock,
  MessagesSquare,
  Calendar
} from "lucide-react";

// Helper to get category display name
function getCategoryDisplay(category: string) {
  const displayMap: Record<string, string> = {
    'INCUBATOR': 'Incubator',
    'ACCELERATOR': 'Accelerator',
    'COWORKING': 'Coworking Space',
    'INVESTOR': 'Investor',
    'GOVERNMENT': 'Government Initiative',
    'EDUCATION': 'Educational Program',
    'COMMUNITY': 'Community Organization',
  };
  return displayMap[category] || category;
}

// Helper to get color styling based on category
const categoryColorMap: Record<string, string> = {
  'INCUBATOR': 'bg-blue-100 text-blue-800',
  'ACCELERATOR': 'bg-purple-100 text-purple-800',
  'COWORKING': 'bg-green-100 text-green-800',
  'INVESTOR': 'bg-amber-100 text-amber-800',
  'GOVERNMENT': 'bg-red-100 text-red-800',
  'EDUCATION': 'bg-teal-100 text-teal-800',
  'COMMUNITY': 'bg-pink-100 text-pink-800',
};

// Helper to get a deterministic rating based on ID to avoid hydration mismatch
function getDeterministicRating(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const normalized = Math.abs(hash % 100) / 100; // 0 to 0.99
  return (normalized * (5.0 - 4.0) + 4.0).toFixed(1);
}

// Helper to get amenity icon
function getAmenityIcon(amenity: string) {
  switch (amenity.toLowerCase()) {
    case 'wifi':
      return <Wifi className="h-4 w-4 text-green-600" />;
    case 'coffee':
      return <Coffee className="h-4 w-4 text-green-600" />;
    case 'meeting':
      return <Users className="h-4 w-4 text-green-600" />;
    default:
      return <Zap className="h-4 w-4 text-green-600" />;
  }
}

// Helper to get service description
function getServiceDescription(service: string, category: string) {
  switch (category) {
    case 'INCUBATOR':
      switch (service.toLowerCase()) {
        case 'mentorship':
          return 'Get guidance from experienced mentors to help you grow your business.';
        case 'networking':
          return 'Connect with other entrepreneurs, investors, and industry experts.';
        case 'funding':
          return 'Access funding opportunities to help you scale your business.';
        default:
          return '';
      }
    case 'ACCELERATOR':
      switch (service.toLowerCase()) {
        case 'acceleration':
          return 'Get accelerated growth through our intensive programs.';
        case 'funding':
          return 'Access funding opportunities to help you scale your business.';
        case 'networking':
          return 'Connect with other entrepreneurs, investors, and industry experts.';
        default:
          return '';
      }
    default:
      return '';
  }
}

// Helper to get programs for builder
function getProgramsForBuilder(builder: any) {
  // Generate different program types based on builder category
  const category = builder.category;
  const programs = [
    {
      name: category === 'INVESTOR' ? 'Investment Opportunity' : 'Startup Accelerator Program',
      description: category === 'INVESTOR' 
        ? 'Investment opportunities for high-growth startups in Ethiopia.'
        : 'Our flagship accelerator program to help startups scale quickly.',
      tags: category === 'INVESTOR' ? ['Funding', 'Equity'] : ['Mentorship', 'Growth'],
      status: 'Open',
      duration: '3 months',
      cohortSize: '10 startups',
    },
    {
      name: category === 'INVESTOR' ? 'Seed Funding Program' : 'Innovation Incubator',
      description: category === 'INVESTOR'
        ? 'Early-stage funding for promising startups with validated concepts.'
        : 'Support program for early-stage startups developing innovative solutions.',
      tags: category === 'INVESTOR' ? ['Seed', 'Early-stage'] : ['Ideation', 'MVP'],
      status: 'Coming Soon',
      duration: '6 months',
      cohortSize: '20 startups',
    },
  ];
  
  return programs;
}

// Helper to get program image
function getProgramImage(_programName: string, index: number) {
  // Use index to choose between different images
  const images = [
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071"
  ];
  return images[index % images.length];
}

// Helper to get success story founded year
function getSuccessStoryFoundedYear(index: number) {
  // Generate different years based on index
  const baseYear = 2015;
  return `Founded ${baseYear + (index % 5)}`;
}

// Helper to get success story category
function getSuccessStoryCategory(index: number) {
  // Generate different categories based on index
  const categories = ['Technology', 'Healthcare', 'Agriculture', 'Finance', 'Education'];
  return categories[index % categories.length];
}

// Helper to get success story achievements
function getSuccessStoryAchievements(index: number) {
  // Generate different achievements based on index
  const commonAchievements = [
    'Raised significant funding',
    'Expanded to new markets',
    'Grew team size significantly'
  ];
  
  const uniqueAchievements = [
    ['Reached 100,000+ users', 'Featured in TechCrunch', 'Won innovation award'],
    ['Acquired by larger company', 'Reached profitability', 'Launched internationally'],
    ['Partnered with government', 'Developed proprietary technology', 'Built sustainable business model']
  ];
  
  return [...commonAchievements, ...uniqueAchievements[index % uniqueAchievements.length]];
}

export default async function PublicBuilderDetailsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const builders = await getEcosystemBuilders();
  const builder = builders.find(b => b.id === params.id);
  
  if (!builder) {
    notFound();
  }
  
  const isCoworkingSpace = builder.category === "COWORKING";
  const rating = getDeterministicRating(builder.id);
  
  // Get background image based on category
  const bgImage = {
    'INCUBATOR': "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070",
    'ACCELERATOR': "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070",
    'COWORKING': "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2070", 
    'INVESTOR': "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=2078",
    'GOVERNMENT': "https://images.unsplash.com/photo-1590650153855-d9e808231d41?q=80&w=2070",
    'EDUCATION': "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070",
    'COMMUNITY': "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?q=80&w=2070",
  }[builder.category] || "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?q=80&w=2070";
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner with Overlay */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-gray-800">
        <div className="absolute inset-0 z-0">
          <Image 
            src={bgImage}
            alt={builder.name} 
            fill 
            className="object-cover opacity-70"
            priority
          />
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-0">
          
        </div>
        
        <div className="container mx-auto px-4 relative z-10 h-full flex flex-col">
          {/* Back/Share buttons in top corners */}
          <div className="flex justify-between items-center pt-4">
            <Link href="/ecosystem/builders" className="inline-flex items-center text-sm font-medium text-white hover:text-white/80">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Directory
            </Link>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:text-white/80 hover:bg-white/10">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:text-white/80 hover:bg-white/10">
                <Bookmark className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
          
          {/* Builder info at the bottom of hero */}
          <div className="mt-auto flex items-center gap-6 pb-8">
            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {builder.logo ? (
                <Image 
                  src={builder.logo} 
                  alt={builder.name} 
                  width={96} 
                  height={96}
                  className="object-cover"
                />
              ) : (
                <Building className="h-12 w-12 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5">
                <Badge className={categoryColorMap[builder.category] || 'bg-gray-100 text-gray-800'}>
                  {getCategoryDisplay(builder.category)}
                </Badge>
                
                {builder.category === "ACCELERATOR" && (
                  <Badge variant="outline" className="border-green-200 text-green-700 flex items-center gap-1 bg-green-50">
                    <CheckCircle size={12} />
                    Featured
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-1">{builder.name}</h1>
              
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="fill-yellow-400 h-4 w-4" />
                <Star className="fill-yellow-400 h-4 w-4" />
                <Star className="fill-yellow-400 h-4 w-4" />
                <Star className="fill-yellow-400 h-4 w-4" />
                <Star className="fill-yellow-400 h-4 w-4 opacity-30" />
                <span className="text-white ml-1">{rating}</span>
                <span className="text-white/60 text-sm ml-2">
                  {isCoworkingSpace ? 'Modern workspace with amenities' : 'Innovative support programs'}
                </span>
              </div>
              
              <div className="flex items-center mt-3 text-white/80 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{builder.location}</span>
                
                {isCoworkingSpace && builder.operatingHours && (
                  <>
                    <span className="mx-2">•</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{builder.operatingHours}</span>
                  </>
                )}
                
                {builder.foundedYear && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Est. {builder.foundedYear}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              {isCoworkingSpace && builder.pricingPlans && builder.pricingPlans.length > 0 && (
                <div className="text-right mb-3">
                  <div className="text-white/60 text-xs">Price range</div>
                  <div className="text-white text-xl font-semibold">
                    {builder.pricingPlans[0].price}+
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap mt-4 gap-2">
                {builder.contactEmail && (
                  <Button size="sm" variant="secondary" className="bg-white hover:bg-gray-100 text-gray-800">
                    <Mail className="mr-1 h-4 w-4" />
                    Contact Now
                  </Button>
                )}
                
                <Button size="sm" variant="secondary" className="bg-white hover:bg-gray-100 text-gray-800" asChild>
                  <Link href={builder.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-1 h-4 w-4" />
                    Website
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="spaces" disabled={!isCoworkingSpace}>
                {isCoworkingSpace ? 'Spaces' : 'Programs'}
              </TabsTrigger>
              <TabsTrigger value="success">Success Stories</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="bg-white py-3 border-b">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {builder.detailedLocation?.googleMapsUrl && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={builder.detailedLocation.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="mr-1 h-4 w-4" />
                    Directions
                  </Link>
                </Button>
              )}
              
              {builder.contactEmail && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${builder.contactEmail}`}>
                    <Mail className="mr-1 h-4 w-4" />
                    Contact Now
                  </a>
                </Button>
              )}
              
              <Button variant="outline" size="sm" asChild>
                <Link href={builder.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-1 h-4 w-4" />
                  Website
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-sm p-5 mb-5" id="about">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 whitespace-pre-line mb-6">
                {builder.description}
              </p>
              
              {isCoworkingSpace && builder.amenities && builder.amenities.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-lg font-medium mb-2">Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
                    {builder.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center">
                        <div className={`mr-2 p-1 rounded-full bg-green-100`}>
                          {getAmenityIcon(amenity)}
                        </div>
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Services Section */}
              {builder.services && builder.services.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-lg font-medium mb-2">Services</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
                    {builder.services.map((service) => (
                      <div key={service} className="flex items-center">
                        <div className="mr-2 p-1 rounded-full bg-blue-100">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-gray-700">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Focus Sectors */}
              {builder.focusSectors && builder.focusSectors.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Focus Sectors</h3>
                  <div className="flex flex-wrap gap-2">
                    {builder.focusSectors.map((sector) => (
                      <Badge key={sector} variant="secondary" className="px-3 py-1">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Services Section */}
            <div className="bg-white rounded-lg shadow-sm p-5 mb-5" id="services">
              <h2 className="text-xl font-semibold mb-4">Our Services</h2>
              
              {builder.services && builder.services.length > 0 ? (
                <div className="space-y-6">
                  {builder.services.map((service, index) => (
                    <div key={index} className="border-b pb-5 last:border-0 last:pb-0">
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-blue-100 mr-3 mt-0.5">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{service}</h3>
                          <p className="text-gray-600 mt-1">
                            {getServiceDescription(service, builder.category)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">No services information available.</div>
              )}
              
              {/* If it's a coworking space, show pricing plans */}
              {isCoworkingSpace && builder.pricingPlans && builder.pricingPlans.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Membership Plans</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {builder.pricingPlans.map((plan, index) => (
                      <div 
                        key={index} 
                        className={`border rounded-lg p-5 ${plan.featured ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500' : ''}`}
                      >
                        {plan.featured && (
                          <div className="bg-blue-500 text-white text-xs font-semibold uppercase tracking-wide py-1 px-3 rounded-full inline-block mb-2">
                            Popular
                          </div>
                        )}
                        <h4 className="text-xl font-semibold">{plan.name}</h4>
                        <div className="flex items-baseline mt-2 mb-4">
                          <span className="text-2xl font-bold">{plan.price}</span>
                          <span className="text-gray-500 ml-1">/{plan.billingCycle}</span>
                        </div>
                        <p className="text-gray-600 mb-4">{plan.description}</p>
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full">Select Plan</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Spaces/Programs Section */}
            <div className="bg-white rounded-lg shadow-sm p-5 mb-5" id="spaces">
              <h2 className="text-xl font-semibold mb-4">
                {isCoworkingSpace ? "Available Spaces" : "Our Programs"}
              </h2>
              
              {isCoworkingSpace ? (
                /* Spaces for coworking spaces */
                builder.spaces && builder.spaces.length > 0 ? (
                  <div className="space-y-6">
                    {builder.spaces.map((space, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        {/* Space image */}
                        <div className="h-48 relative">
                          <Image 
                            src={space.image || "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069"}
                            alt={space.name}
                            fill
                            className="object-cover"
                          />
                          {space.type && (
                            <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {space.type}
                            </div>
                          )}
                          {!space.available && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
                              Currently Booked
                            </div>
                          )}
                        </div>
                        
                        {/* Space details */}
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg">{space.name}</h3>
                            <Badge variant={space.available ? "success" : "destructive"}>
                              {space.available ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mt-2 mb-4">{space.description}</p>
                          
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-1 text-gray-400" />
                              Capacity: {space.capacity}
                            </div>
                            
                            {space.pricePerHour && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">{space.pricePerHour}</span> / hour
                              </div>
                            )}
                            
                            {space.pricePerDay && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">{space.pricePerDay}</span> / day
                              </div>
                            )}
                            
                            {space.pricePerMonth && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">{space.pricePerMonth}</span> / month
                              </div>
                            )}
                          </div>
                          
                          {/* Amenities */}
                          {space.amenities && space.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {space.amenities.map((amenity, idx) => (
                                <Badge key={idx} variant="outline" className="bg-gray-50">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <Button 
                            className="w-full" 
                            disabled={!space.available}
                          >
                            {space.available ? 'Book This Space' : 'Join Waitlist'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No spaces information available.</div>
                )
              ) : (
                /* Programs for incubators/accelerators */
                <div className="space-y-6">
                  {getProgramsForBuilder(builder).map((program, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {/* Program image */}
                        <div className="h-48 md:w-1/3 relative">
                          <Image 
                            src={getProgramImage(program.name, index)}
                            alt={program.name}
                            fill
                            className="object-cover"
                          />
                          {program.status && (
                            <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-semibold ${
                              program.status === 'Open' ? 'bg-green-500 text-white' : 
                              program.status === 'Coming Soon' ? 'bg-amber-500 text-white' : 
                              'bg-red-500 text-white'
                            }`}>
                              {program.status}
                            </div>
                          )}
                        </div>
                        
                        {/* Program details */}
                        <div className="p-4 md:w-2/3">
                          <h3 className="font-semibold text-lg">{program.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-1 mb-3">
                            {program.tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800 border-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <p className="text-gray-600 mb-4">{program.description}</p>
                          
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                              Duration: {program.duration}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-1 text-gray-400" />
                              Cohort Size: {program.cohortSize}
                            </div>
                          </div>
                          
                          <Button 
                            className={`${
                              builder.category === 'INVESTOR' ? 'bg-amber-600 hover:bg-amber-700' : 
                              'bg-blue-600 hover:bg-blue-700'
                            }`}
                            disabled={program.status === 'Closed'}
                          >
                            {builder.category === 'INVESTOR' ? 'Request Funding' : 'Apply Now'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Success Stories Section */}
            <div className="bg-white rounded-lg shadow-sm p-5" id="success">
              <h2 className="text-xl font-semibold mb-4">Success Stories</h2>
              
              {builder.successStories && builder.successStories.length > 0 ? (
                <div className="space-y-6">
                  {builder.successStories.map((story, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-xl mr-3">
                            {story.startupName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{story.startupName}</h3>
                            <div className="text-sm text-gray-500">
                              {getSuccessStoryFoundedYear(index)} • {getSuccessStoryCategory(index)}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{story.description}</p>
                        
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-medium mb-2">Achievements</h4>
                          <div className="space-y-2">
                            {getSuccessStoryAchievements(index).map((achievement, idx) => (
                              <div key={idx} className="flex">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                <span>{achievement}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">No success stories available.</div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Location Info */}
            <div className="bg-white rounded-lg shadow-sm p-5 mb-5">
              <h3 className="text-lg font-medium mb-3">Location</h3>
              <div className="mb-3 flex items-start">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-gray-800">{builder.detailedLocation?.address || builder.location}</p>
                  {builder.detailedLocation?.city && (
                    <p className="text-gray-600">{builder.detailedLocation.city}</p>
                  )}
                  {builder.detailedLocation?.directions && (
                    <p className="text-gray-600 text-sm mt-1">{builder.detailedLocation.directions}</p>
                  )}
                </div>
              </div>
              
              {builder.detailedLocation?.googleMapsUrl && (
                <div className="mt-3">
                  <a 
                    href={builder.detailedLocation.googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm hover:underline flex items-center"
                  >
                    View on Google Maps
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              )}
              
              {isCoworkingSpace && builder.operatingHours && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <h3 className="font-medium">Operating Hours</h3>
                  </div>
                  <p className="text-gray-800">{builder.operatingHours}</p>
                  {builder.membershipStatus && (
                    <p className="text-gray-600 text-sm">Status: {builder.membershipStatus}</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-5 mb-5">
              <h3 className="text-lg font-medium mb-3">Contact Information</h3>
              
              {builder.contactEmail && (
                <div className="flex items-start mb-3">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <a href={`mailto:${builder.contactEmail}`} className="text-blue-600 hover:underline">
                      {builder.contactEmail}
                    </a>
                  </div>
                </div>
              )}
              
              {builder.website && (
                <div className="flex items-start">
                  <Globe className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <a 
                      href={builder.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-words"
                    >
                      {builder.website.replace(/https?:\/\/(www\.)?/, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* CTA */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="text-lg font-medium mb-3">
                {isCoworkingSpace ? 'Interested in booking a space?' : 'Interested in applying?'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isCoworkingSpace 
                  ? 'Book a desk, meeting room, or private office at this coworking space.'
                  : `Apply to ${getCategoryDisplay(builder.category).toLowerCase()} program or request more information.`
                }
              </p>
              {isCoworkingSpace ? (
                <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                  <Link href={`/login?redirectTo=${encodeURIComponent(`/dashboard/ecosystem/builders/${builder.id}?action=booking`)}`}>
                    Book Space
                  </Link>
                </Button>
              ) : (
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href={`/login?redirectTo=${encodeURIComponent(`/dashboard/ecosystem/builders/${builder.id}?action=apply`)}`}>
                    {builder.category === "INVESTOR" ? "Request Funding" : "Apply Now"}
                  </Link>
                </Button>
              )}
              <div className="mt-3 text-center text-sm text-gray-500">
                Login required. Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="text-blue-600 hover:underline">
                  Register here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
