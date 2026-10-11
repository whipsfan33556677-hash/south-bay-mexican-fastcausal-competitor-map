export type CategoryName =
  | 'Current QDOBA operations on-site'
  | 'Direct Category Rivals'
  | 'Adjacent Fast-Casual Chains'
  | 'Drive Thru / Value Chains'
  | 'Free-Standing Establishment, One Location'
  | 'Plaza El Segundo Location';

export interface CategoryMeta {
  name: CategoryName;
  color: string;
  description: string;
}

export const CATEGORY_COLORS: Record<CategoryName, string> = {
  'Current QDOBA operations on-site': '#E65100',
  'Direct Category Rivals': '#C2185B',
  'Adjacent Fast-Casual Chains': '#A52714',
  'Drive Thru / Value Chains': '#0288D1',
  'Free-Standing Establishment, One Location': '#4E342E',
  'Plaza El Segundo Location': '#FFD600',
};

export const ONSITE_CATEGORY: CategoryMeta = {
  name: 'Current QDOBA operations on-site',
  color: '#E65100',
  description: 'QDOBA Mexican Eats (Loyola Marymount University)',
};

export const COMPETITIVE_CATEGORIES: CategoryMeta[] = [
  {
    name: 'Direct Category Rivals',
    color: '#C2185B',
    description: 'Chipotle (10), Rubio\'s (2), Baja Fresh (1), Cafe Rio (1) - 14 Locations',
  },
  {
    name: 'Adjacent Fast-Casual Chains',
    color: '#A52714',
    description: 'Panda Express (10), Panera Bread (4), sweetgreen (3), CAVA (1) - 18 Locations',
  },
  {
    name: 'Drive Thru / Value Chains',
    color: '#0288D1',
    description: 'Taco Bell (16), Del Taco (4), El Pollo Loco (21) - Drive Thru / Value Chains',
  },
  {
    name: 'Free-Standing Establishment, One Location',
    color: '#4E342E',
    description: 'HomeState (The Point)',
  },
  {
    name: 'Plaza El Segundo Location',
    color: '#FFD600',
    description: 'Plaza El Segundo Commercial Anchor',
  },
];

export const CATEGORIES: CategoryMeta[] = [
  ONSITE_CATEGORY,
  ...COMPETITIVE_CATEGORIES,
];

export interface CompetitorLocation {
  id: string;
  name: string;
  brand: string;
  address: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  category: CategoryName;
  categoryColor: string;
  source: string;
  notes?: string;
  phone?: string;
  shoppingCenter?: string;
  unitDesignation?: string;
  precision?: 'Rooftop Verified' | 'Entrance Verified' | '[Needs Manual Verification]';
  // Dynamic screen/spiderfy display coordinates (never overwrite lat/lon!)
  displayLat?: number;
  displayLon?: number;
}

export interface MapState {
  center: [number, number];
  zoom: number;
  selectedLocationId: string | null;
  hoveredLocationId: string | null;
  searchQuery: string;
  selectedCategories: CategoryName[];
  selectedBrands: string[];
  isSidebarOpen: boolean;
  isLegendOpen: boolean;
  mapStyle: 'voyager' | 'positron' | 'satellite';
}
