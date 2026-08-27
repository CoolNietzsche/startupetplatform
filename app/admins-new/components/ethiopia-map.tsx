"use client";

import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { ethiopiaGeoData, regionalData, mapConfig } from "./ethiopia-map-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Define the type for region data
type RegionData = {
  startups: number;
  ecosystemBuilders: number;
  funding: string;
  color: string;
};

type DataDisplayMode = "startups" | "ecosystemBuilders" | "funding";

const EthiopiaMap = () => {
  const [tooltipContent, setTooltipContent] = useState<{
    name: string;
    data: RegionData;
    position: { x: number; y: number };
  } | null>(null);
  
  const [dataMode, setDataMode] = useState<DataDisplayMode>("startups");

  // Calculate the maximum value for scaling
  const maxStartups = Math.max(...Object.values(regionalData).map(d => d.startups));
  const maxEcosystemBuilders = Math.max(...Object.values(regionalData).map(d => d.ecosystemBuilders));
  
  // Scale for markers/regions
  const markerScale = scaleLinear()
    .domain([0, dataMode === "startups" ? maxStartups : maxEcosystemBuilders])
    .range([4, 25]);

  // Handle tooltip display
  const handleMouseEnter = (geo: any, evt: React.MouseEvent) => {
    const { name } = geo.properties;
    const regionData = regionalData[name as keyof typeof regionalData];
    if (regionData) {
      setTooltipContent({
        name,
        data: regionData,
        position: { x: evt.clientX, y: evt.clientY }
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltipContent(null);
  };

  // Return different colors based on the data mode
  const getRegionColor = (regionName: string) => {
    const region = regionalData[regionName as keyof typeof regionalData];
    if (!region) return "#F5F5F5";
    
    if (dataMode === "startups") {
      const opacity = Math.min(1, region.startups / maxStartups);
      return `rgba(43, 123, 67, ${0.3 + (opacity * 0.7)})`;
    } else if (dataMode === "ecosystemBuilders") {
      const opacity = Math.min(1, region.ecosystemBuilders / maxEcosystemBuilders);
      return `rgba(43, 123, 67, ${0.3 + (opacity * 0.7)})`;
    }
    
    return region.color;
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Regional Distribution</CardTitle>
            <CardDescription>Startup ecosystem across Ethiopia</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge 
              variant={dataMode === "startups" ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setDataMode("startups")}
            >
              Startups
            </Badge>
            <Badge 
              variant={dataMode === "ecosystemBuilders" ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setDataMode("ecosystemBuilders")}
            >
              Ecosystem Builders
            </Badge>
            <Badge 
              variant={dataMode === "funding" ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setDataMode("funding")}
            >
              Funding
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="w-full h-[500px]">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 2500,
                center: [40, 9.5] // Centered on Ethiopia
              }}
              style={{ width: "100%", height: "100%" }}
            >
              <ZoomableGroup center={[40, 9.5]} zoom={1}>
                {/* Render Ethiopia Regions as Polygons */}
                <Geographies geography={ethiopiaGeoData}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const { name } = geo.properties;
                      return (
                        <Geography
                          key={geo.rsmKey || geo.properties.name}
                          geography={geo}
                          fill={getRegionColor(name)}
                          stroke="#FFFFFF"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { outline: "none", fill: "#2b7b43" },
                            pressed: { outline: "none" }
                          }}
                          onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                          onMouseLeave={handleMouseLeave}
                        />
                      );
                    })
                  }
                </Geographies>

                {/* Add markers for cities/regions with point geometry */}
                {ethiopiaGeoData.features
                  .filter(feature => feature.geometry.type === "Point")
                  .map((feature) => {
                    const regionName = feature.properties.name;
                    const region = regionalData[regionName as keyof typeof regionalData];
                    if (!region) return null;

                    const markerSize = dataMode === "funding" 
                      ? 10 
                      : markerScale(dataMode === "startups" ? region.startups : region.ecosystemBuilders);

                    return (
                      <Marker 
                        key={feature.properties.name}
                        coordinates={feature.geometry.coordinates as [number, number]}
                        onMouseEnter={(evt) => {
                          setTooltipContent({
                            name: regionName,
                            data: region,
                            position: { x: evt.clientX, y: evt.clientY }
                          });
                        }}
                        onMouseLeave={handleMouseLeave}
                      >
                        <circle 
                          r={markerSize} 
                          fill={getRegionColor(regionName)}
                          stroke="#FFFFFF"
                          strokeWidth={1}
                          opacity={0.8}
                        />
                        <text
                          textAnchor="middle"
                          y={markerSize > 15 ? 2 : -markerSize - 5}
                          style={{
                            fontFamily: "Arial",
                            fontSize: 10,
                            fontWeight: "bold",
                            fill: "#333"
                          }}
                        >
                          {regionName}
                        </text>
                        {markerSize > 15 && (
                          <text
                            textAnchor="middle"
                            y={4}
                            style={{
                              fontFamily: "Arial",
                              fontSize: 8,
                              fill: "#FFF",
                              fontWeight: "bold"
                            }}
                          >
                            {dataMode === "startups" ? region.startups : region.ecosystemBuilders}
                          </text>
                        )}
                      </Marker>
                    );
                  })}
              </ZoomableGroup>
            </ComposableMap>
          </div>

          {/* Tooltip */}
          {tooltipContent && (
            <div
              className="absolute bg-white p-2 rounded shadow-md border border-gray-200 z-10 min-w-40"
              style={{
                left: `${tooltipContent.position.x}px`,
                top: `${tooltipContent.position.y}px`,
                transform: "translate(-50%, -130%)"
              }}
            >
              <h3 className="font-bold">{tooltipContent.name}</h3>
              <div className="grid grid-cols-2 gap-x-2 text-sm">
                <span className="text-gray-600">Startups:</span>
                <span className="font-medium">{tooltipContent.data.startups}</span>
                <span className="text-gray-600">Ecosystem:</span>
                <span className="font-medium">{tooltipContent.data.ecosystemBuilders}</span>
                <span className="text-gray-600">Funding:</span>
                <span className="font-medium">{tooltipContent.data.funding}</span>
              </div>
            </div>
          )}
        </div>

        {/* Map legend */}
        <div className="flex justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#2b7b43]"></div>
            <span className="text-sm">High concentration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#57a773]"></div>
            <span className="text-sm">Medium concentration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#99c7a6]"></div>
            <span className="text-sm">Low concentration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#d9eadd]"></div>
            <span className="text-sm">Minimal activity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EthiopiaMap;
