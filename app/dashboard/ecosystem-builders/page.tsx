import { Suspense } from "react";
import { getEcosystemData } from "@/lib/actions/ecosystem";
import { EcosystemBuilderClient } from "./client";

export default async function EcosystemBuildersPage() {
  // Server-side data fetching
  const ecosystemData = await getEcosystemData();
  const builders = ecosystemData.ecosystemBuilders;
  
  // Extract all unique sectors for filtering
  const allSectors = Array.from(
    new Set(
      builders
        .flatMap((builder) => builder.focusSectors || [])
        .filter(Boolean)
    )
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Certified Startups</h1>
            <p className="text-muted-foreground">
              Discover and connect with startups that have been officially certified by Startup Ethiopia.
            </p>
          </div>
          <div className="rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 p-4 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Ethiopia&apos;s Certified Innovation</h2>
            <p className="text-sm text-gray-700 mb-3">
              These startups have undergone a rigorous certification process and represent the forefront of innovation in Ethiopia.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-800">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 inline-block rounded-full bg-indigo-500"></span>
                {builders.length} Certified Startups in Database
              </span>
            </div>
          </div>
        </div>
        

      </div>

      <Suspense fallback={
        <div className="p-8 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
        </div>
      }>
        <EcosystemBuilderClient 
          initialBuilders={builders} 
          allSectors={allSectors} 
        />
      </Suspense>
    </div>
  );
}
