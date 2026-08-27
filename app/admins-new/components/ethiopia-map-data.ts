// GeoJSON data for Ethiopia's regions
export const ethiopiaGeoData = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Addis Ababa",
        "id": "ET-AA",
        "HASC": "ET.AA"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [38.7468, 9.0300]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Amhara",
        "id": "ET-AM",
        "HASC": "ET.AM"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[37.5, 12.5], [38.5, 12.5], [38.5, 11.5], [37.5, 11.5], [37.5, 12.5]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Oromia",
        "id": "ET-OR",
        "HASC": "ET.OR"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[38.0, 9.5], [39.0, 9.5], [39.0, 8.5], [38.0, 8.5], [38.0, 9.5]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Sidama",
        "id": "ET-SI",
        "HASC": "ET.SI"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[38.3, 7.0], [38.8, 7.0], [38.8, 6.5], [38.3, 6.5], [38.3, 7.0]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "SNNPR",
        "id": "ET-SN",
        "HASC": "ET.SN"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[37.0, 7.5], [38.0, 7.5], [38.0, 6.5], [37.0, 6.5], [37.0, 7.5]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Tigray",
        "id": "ET-TI",
        "HASC": "ET.TI"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[38.5, 14.2], [39.5, 14.2], [39.5, 13.2], [38.5, 13.2], [38.5, 14.2]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Afar",
        "id": "ET-AF",
        "HASC": "ET.AF"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[40.5, 12.0], [41.5, 12.0], [41.5, 11.0], [40.5, 11.0], [40.5, 12.0]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Somali",
        "id": "ET-SO",
        "HASC": "ET.SO"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[42.0, 9.0], [43.0, 9.0], [43.0, 8.0], [42.0, 8.0], [42.0, 9.0]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Dire Dawa",
        "id": "ET-DD",
        "HASC": "ET.DD"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [41.8570, 9.5930]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Harari",
        "id": "ET-HA",
        "HASC": "ET.HA"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [42.1170, 9.3200]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Gambela",
        "id": "ET-GA",
        "HASC": "ET.GA"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[34.5, 8.0], [35.5, 8.0], [35.5, 7.0], [34.5, 7.0], [34.5, 8.0]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Benishangul-Gumuz",
        "id": "ET-BE",
        "HASC": "ET.BE"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[35.0, 11.0], [36.0, 11.0], [36.0, 10.0], [35.0, 10.0], [35.0, 11.0]]]
      }
    }
  ]
};

// Regional data - startups, ecosystem builders, funding
export const regionalData = {
  "Addis Ababa": { startups: 317, ecosystemBuilders: 38, funding: "52.4M ETB", color: "#2b7b43" },
  "Amhara": { startups: 25, ecosystemBuilders: 3, funding: "4.8M ETB", color: "#57a773" },
  "Oromia": { startups: 42, ecosystemBuilders: 5, funding: "8.7M ETB", color: "#57a773" },
  "Sidama": { startups: 28, ecosystemBuilders: 4, funding: "5.2M ETB", color: "#57a773" },
  "SNNPR": { startups: 19, ecosystemBuilders: 3, funding: "3.6M ETB", color: "#99c7a6" },
  "Tigray": { startups: 15, ecosystemBuilders: 2, funding: "2.9M ETB", color: "#99c7a6" },
  "Afar": { startups: 5, ecosystemBuilders: 1, funding: "0.8M ETB", color: "#c6dfca" },
  "Somali": { startups: 7, ecosystemBuilders: 1, funding: "1.2M ETB", color: "#c6dfca" },
  "Dire Dawa": { startups: 12, ecosystemBuilders: 2, funding: "2.3M ETB", color: "#99c7a6" },
  "Harari": { startups: 4, ecosystemBuilders: 1, funding: "0.7M ETB", color: "#c6dfca" },
  "Gambela": { startups: 2, ecosystemBuilders: 0, funding: "0.3M ETB", color: "#d9eadd" },
  "Benishangul-Gumuz": { startups: 3, ecosystemBuilders: 0, funding: "0.5M ETB", color: "#d9eadd" }
};

// Map center coordinates and zoom level
export const mapConfig = {
  center: [38.7468, 9.0300], // Addis Ababa
  zoom: 5
};
