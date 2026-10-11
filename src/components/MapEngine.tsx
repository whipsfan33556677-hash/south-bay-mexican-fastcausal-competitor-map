import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { CompetitorLocation, CategoryName } from '../types/competitor';
import { calculateClusters, SpiderfiedLocation } from '../utils/mapClustering';
import { generateMarkerHtml, generateClusterHtml } from '../utils/markerRenderer';

interface MapEngineProps {
  locations: CompetitorLocation[];
  selectedLocationId: string | null;
  hoveredLocationId: string | null;
  onSelectLocation: (location: CompetitorLocation | null) => void;
  onHoverLocation: (locationId: string | null) => void;
  mapStyle: 'voyager' | 'positron' | 'satellite';
}

// Center of South Bay Mexican Fast-Casual study (El Segundo / Hawthorne / Manhattan Beach)
const DEFAULT_CENTER: [number, number] = [33.885, -118.375];
const DEFAULT_ZOOM = 12;

// CARTO API Key for Positron and Voyager Basemaps
const CARTO_API_KEY =
  (import.meta.env.VITE_CARTO_API_KEY as string | undefined)?.trim() ||
  'cb1_42kp_1_599f254e2a3c5a2e460b14c5';

const getTileUrl = (style: 'voyager' | 'positron' | 'satellite') => {
  if (style === 'satellite') {
    return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  }
  // CARTO basemaps API requires the query parameter to be 'key'
  const keyQuery = CARTO_API_KEY
    ? `?key=${encodeURIComponent(CARTO_API_KEY)}&api_key=${encodeURIComponent(CARTO_API_KEY)}`
    : '';
  if (style === 'positron') {
    return `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${keyQuery}`;
  }
  return `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${keyQuery}`;
};

export const MapEngine: React.FC<MapEngineProps> = ({
  locations,
  selectedLocationId,
  hoveredLocationId,
  onSelectLocation,
  onHoverLocation,
  mapStyle,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const spiderfyLinesLayerRef = useRef<L.LayerGroup | null>(null);

  const [currentZoom, setCurrentZoom] = useState<number>(DEFAULT_ZOOM);
  const [spiderfiedClusterId, setSpiderfiedClusterId] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create map with smooth panning and zooming options
    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false, // We use custom modern floating zoom controls
      attributionControl: false, // Clean custom attribution
      fadeAnimation: true,
      zoomAnimation: true,
      minZoom: 10,
      maxZoom: 18,
    });

    mapInstanceRef.current = map;

    // Add modern CartoDB Positron / Voyager tiles (clean, high DPI, beautiful road & place labels)
    const tileLayer = L.tileLayer(getTileUrl(mapStyle), {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer groups for markers and spiderfy connector lines
    spiderfyLinesLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Event listeners
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    map.on('click', (e) => {
      // If clicking empty map area, deselect and close spiderfy
      const originalTarget = e.originalEvent.target as HTMLElement;
      if (!originalTarget.closest('.competitor-marker-wrapper') && !originalTarget.closest('.competitor-cluster-wrapper')) {
        onSelectLocation(null);
        setSpiderfiedClusterId(null);
      }
    });

    // Initial bounding box to frame South Bay & LMU (QDOBA) appropriately
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lon]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer if mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(getTileUrl(mapStyle), {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);
  }, [mapStyle]);

  // When selectedLocation changes, smoothly fly camera toward location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedLocationId) return;

    const loc = locations.find((l) => l.id === selectedLocationId);
    if (loc) {
      const targetZoom = Math.max(map.getZoom(), 14);
      map.flyTo([loc.lat, loc.lon], targetZoom, {
        duration: 0.8,
        easeLinearity: 0.25,
      });
    }
  }, [selectedLocationId, locations]);

  // Render Markers, Clusters, and Spiderfy lines
  const renderMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const linesLayer = spiderfyLinesLayerRef.current;

    if (!map || !markersLayer || !linesLayer) return;

    markersLayer.clearLayers();
    linesLayer.clearLayers();

    const { clusters, spiderfied } = calculateClusters(
      locations,
      map,
      currentZoom,
      spiderfiedClusterId
    );

    // If a cluster is spiderfied, draw connector lines and spiderfied markers
    if (spiderfied && spiderfied.length > 0) {
      spiderfied.forEach((item: SpiderfiedLocation) => {
        // SVG connector line from origin to spiderfied display point
        const line = L.polyline(
          [
            [item.originLat, item.originLon],
            [item.displayLat, item.displayLon],
          ],
          {
            color: item.location.categoryColor,
            weight: 2,
            opacity: 0.75,
            dashArray: '3, 4',
          }
        );
        linesLayer.addLayer(line);

        // Marker at spiderfied display position
        const isSelected = item.location.id === selectedLocationId;
        const isHovered = item.location.id === hoveredLocationId;
        const html = generateMarkerHtml(item.location, isSelected, isHovered, true);

        const icon = L.divIcon({
          html,
          className: 'custom-leaflet-div-icon',
          iconSize: [isSelected ? 46 : 38, isSelected ? 54 : 44],
          iconAnchor: [isSelected ? 23 : 19, isSelected ? 54 : 44],
        });

        const marker = L.marker([item.displayLat, item.displayLon], {
          icon,
          zIndexOffset: isSelected ? 1000 : 500,
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectLocation(item.location);
        });

        marker.on('mouseover', () => {
          onHoverLocation(item.location.id);
        });

        marker.on('mouseout', () => {
          onHoverLocation(null);
        });

        markersLayer.addLayer(marker);
      });
    }

    // Render regular clusters or individual markers
    clusters.forEach((group) => {
      // If this group is currently spiderfied, we already rendered its items above
      if (group.id === spiderfiedClusterId && group.isCluster) {
        // Add a central anchor point dot at origin
        const anchorDot = L.circleMarker([group.centerLat, group.centerLon], {
          radius: 5,
          color: '#FFFFFF',
          weight: 2,
          fillColor: '#1E293B',
          fillOpacity: 1,
        });
        anchorDot.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSpiderfiedClusterId(null);
        });
        markersLayer.addLayer(anchorDot);
        return;
      }

      if (group.isCluster) {
        // Multi-marker cluster
        const html = generateClusterHtml(
          group.locations.length,
          group.categoryColors,
          group.locations.some((l) => l.id === selectedLocationId)
        );

        const icon = L.divIcon({
          html,
          className: 'custom-leaflet-cluster-icon',
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        });

        const marker = L.marker([group.centerLat, group.centerLon], {
          icon,
          zIndexOffset: 300,
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);

          if (currentZoom >= 14 || group.locations.length <= 4) {
            // High zoom or small overlapping cluster: activate SPIDERFY!
            setSpiderfiedClusterId(group.id);
          } else {
            // Zoom into cluster
            map.flyTo([group.centerLat, group.centerLon], currentZoom + 2, {
              duration: 0.6,
            });
          }
        });

        markersLayer.addLayer(marker);
      } else {
        // Individual single location marker
        const loc = group.locations[0];
        const isSelected = loc.id === selectedLocationId;
        const isHovered = loc.id === hoveredLocationId;
        const html = generateMarkerHtml(loc, isSelected, isHovered, false);

        const size = isSelected ? 46 : isHovered ? 42 : 36;
        const pinHeight = isSelected ? 8 : 6;
        const totalHeight = size + pinHeight;

        const icon = L.divIcon({
          html,
          className: 'custom-leaflet-div-icon',
          iconSize: [size, totalHeight],
          iconAnchor: [size / 2, totalHeight],
        });

        const marker = L.marker([loc.lat, loc.lon], {
          icon,
          zIndexOffset: isSelected ? 1000 : isHovered ? 800 : 100,
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectLocation(loc);
        });

        marker.on('mouseover', () => {
          onHoverLocation(loc.id);
        });

        marker.on('mouseout', () => {
          onHoverLocation(null);
        });

        markersLayer.addLayer(marker);
      }
    });
  }, [locations, currentZoom, selectedLocationId, hoveredLocationId, spiderfiedClusterId, onSelectLocation, onHoverLocation]);

  // Trigger render when state changes
  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  // Recalculate clusters on map move/zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMove = () => {
      renderMarkers();
    };

    map.on('move', handleMove);
    return () => {
      map.off('move', handleMove);
    };
  }, [renderMarkers]);

  // Handle external resize
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Floating map control callbacks
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetView = () => {
    if (!mapInstanceRef.current || locations.length === 0) return;
    setSpiderfiedClusterId(null);
    onSelectLocation(null);
    const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lon]));
    mapInstanceRef.current.flyToBounds(bounds, {
      padding: [50, 50],
      duration: 0.9,
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 select-none">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* Floating Modern Zoom & Navigation Controls */}
      <div className="absolute right-4 bottom-8 z-30 flex flex-col items-center gap-2">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-1 flex flex-col divide-y divide-slate-100">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>
        </div>

        {/* Recenter & Fit All Locations */}
        <button
          onClick={handleResetView}
          className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900 group"
          title="Reset South Bay View (Fit all locations)"
          aria-label="Reset map"
        >
          <svg className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        </button>
      </div>

      {/* Clean Map Attribution */}
      <div className="absolute bottom-1 right-2 z-10 text-[10px] text-slate-500 bg-white/85 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs pointer-events-auto select-none border border-slate-200/50">
        {mapStyle === 'satellite' ? (
          <span>Tiles &copy; Esri &mdash; DigitalGlobe, USGS</span>
        ) : (
          <span>
            &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium text-slate-700">CARTO</a>
          </span>
        )}
      </div>

      {/* Spiderfy Exit Banner (if active) */}
      {spiderfiedClusterId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-medium border border-slate-700 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Cluster expanded · Click any location or tap outside to collapse</span>
          <button
            onClick={() => setSpiderfiedClusterId(null)}
            className="ml-2 hover:bg-slate-800 p-1 rounded-full text-slate-300 hover:text-white"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
