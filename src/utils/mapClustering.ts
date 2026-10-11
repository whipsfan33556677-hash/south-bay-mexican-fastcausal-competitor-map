import L from 'leaflet';
import { CompetitorLocation } from '../types/competitor';

export interface ClusterGroup {
  id: string;
  isCluster: boolean;
  locations: CompetitorLocation[];
  centerLat: number;
  centerLon: number;
  categoryColors: string[];
}

export interface SpiderfiedLocation {
  location: CompetitorLocation;
  originLat: number;
  originLon: number;
  displayLat: number;
  displayLon: number;
}

/**
 * Calculates visual clusters based on current map zoom and pixel distance.
 * Never mutates original location coordinates.
 */
export function calculateClusters(
  locations: CompetitorLocation[],
  map: L.Map,
  zoom: number,
  spiderfiedGroupId: string | null
): { clusters: ClusterGroup[]; spiderfied: SpiderfiedLocation[] | null } {
  if (!map || locations.length === 0) {
    return { clusters: [], spiderfied: null };
  }

  // At zoom >= 15, we show almost all individual markers, only clustering direct overlaps (< 28px)
  // At zoom 13-14, cluster threshold is ~36px
  // At zoom <= 12, cluster threshold is ~55px
  const thresholdPx = zoom >= 15 ? 26 : zoom >= 13 ? 38 : 55;

  const points = locations.map((loc) => {
    const latLng = L.latLng(loc.lat, loc.lon);
    const point = map.latLngToLayerPoint(latLng);
    return { loc, point, latLng, clustered: false };
  });

  const clusters: ClusterGroup[] = [];
  let spiderfiedResult: SpiderfiedLocation[] | null = null;

  for (let i = 0; i < points.length; i++) {
    if (points[i].clustered) continue;

    const groupLocations: CompetitorLocation[] = [points[i].loc];
    points[i].clustered = true;

    for (let j = i + 1; j < points.length; j++) {
      if (points[j].clustered) continue;

      const dist = points[i].point.distanceTo(points[j].point);
      if (dist < thresholdPx) {
        groupLocations.push(points[j].loc);
        points[j].clustered = true;
      }
    }

    const isCluster = groupLocations.length > 1;
    // Calculate centroid
    const centerLat =
      groupLocations.reduce((sum, l) => sum + l.lat, 0) / groupLocations.length;
    const centerLon =
      groupLocations.reduce((sum, l) => sum + l.lon, 0) / groupLocations.length;

    const categoryColors = Array.from(
      new Set(groupLocations.map((l) => l.categoryColor))
    );

    const clusterId = `cluster-${groupLocations.map((l) => l.id).sort().join('-')}`;

    // Check if this cluster is currently spiderfied
    if (spiderfiedGroupId === clusterId && isCluster) {
      // Calculate radial spiderfy layout
      const centerPoint = map.latLngToLayerPoint(L.latLng(centerLat, centerLon));
      const count = groupLocations.length;
      const radius = Math.min(65 + count * 8, 110); // comfortable radius in pixels
      const step = (2 * Math.PI) / count;
      const angleOffset = -Math.PI / 2; // start from top

      const spiderfiedItems: SpiderfiedLocation[] = groupLocations.map((loc, idx) => {
        const angle = angleOffset + idx * step;
        const offsetPoint = L.point(
          centerPoint.x + radius * Math.cos(angle),
          centerPoint.y + radius * Math.sin(angle)
        );
        const displayLatLng = map.layerPointToLatLng(offsetPoint);

        return {
          location: loc,
          originLat: centerLat,
          originLon: centerLon,
          displayLat: displayLatLng.lat,
          displayLon: displayLatLng.lng,
        };
      });

      spiderfiedResult = spiderfiedItems;
    }

    clusters.push({
      id: clusterId,
      isCluster,
      locations: groupLocations,
      centerLat,
      centerLon,
      categoryColors,
    });
  }

  return { clusters, spiderfied: spiderfiedResult };
}
