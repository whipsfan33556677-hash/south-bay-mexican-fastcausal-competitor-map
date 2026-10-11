import { CompetitorLocation } from '../types/competitor';
import { getBrandLogoUrl } from '../assets/brandLogos';

/**
 * Creates the HTML string for an individual competitor marker.
 * Strictly adheres to:
 * - Real, true, official brand logo (SVG/PNG)
 * - Category halo ring with exact category color
 * - Brand logo container with pure white background & subtle shadow
 * - Geographic anchor pin pointing to exact coordinate
 * - Crisp rendering without distortion (object-fit: contain)
 */
export function generateMarkerHtml(
  location: CompetitorLocation,
  isSelected: boolean,
  isHovered: boolean,
  isSpiderfied = false
): string {
  const logoUrl = getBrandLogoUrl(location.brand);
  const haloColor = location.categoryColor;

  const size = isSelected ? 46 : isHovered ? 42 : 36;
  const pinHeight = isSelected ? 8 : 6;
  const totalHeight = size + pinHeight;

  const isFullBleedCircular =
    location.brand === 'Panera Bread' ||
    location.brand === 'QDOBA' ||
    location.brand === 'QDOBA Mexican Eats';

  const pulseRing = isSelected
    ? `<div class="absolute -inset-2.5 rounded-full animate-ping opacity-35" style="background-color: ${haloColor}; pointer-events: none;"></div>`
    : '';

  const selectionGlow = isSelected
    ? `box-shadow: 0 0 0 3px #FFFFFF, 0 0 0 6px ${haloColor}, 0 10px 25px -3px rgba(0,0,0,0.4);`
    : `box-shadow: 0 3px 10px rgba(0,0,0,0.22), 0 1px 3px rgba(0,0,0,0.12);`;

  return `
    <div class="competitor-marker-wrapper relative group cursor-pointer transition-transform duration-200 ease-out" 
         style="width: ${size}px; height: ${totalHeight}px; transform-origin: bottom center;"
         data-location-id="${location.id}"
         data-brand="${location.brand}"
         title="${location.name} (${location.category})">
      
      ${pulseRing}

      <!-- Category Halo & Brand Container -->
      <div class="relative w-full rounded-full bg-white flex items-center justify-center overflow-hidden transition-all duration-200"
           style="height: ${size}px; border: 3.5px solid ${haloColor}; ${selectionGlow}">
        <div class="w-full h-full ${isFullBleedCircular ? 'p-0' : 'p-1'} flex items-center justify-center overflow-hidden rounded-full">
          <img 
            src="${logoUrl}" 
            alt="${location.brand}" 
            class="w-full h-full ${isFullBleedCircular ? 'object-cover scale-[1.04] rounded-full' : 'object-contain'} pointer-events-none select-none" 
            loading="eager" 
          />
        </div>
      </div>

      <!-- Geographic Anchor Pointer -->
      <div class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none" style="top: ${size - 1}px;">
        <div class="w-0 h-0 border-solid" 
             style="border-width: ${pinHeight}px ${pinHeight * 0.75}px 0 ${pinHeight * 0.75}px; border-color: ${haloColor} transparent transparent transparent;">
        </div>
        <div class="w-1.5 h-1.5 rounded-full -mt-0.5" style="background-color: ${haloColor}; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
      </div>

      ${
        isSpiderfied
          ? `<div class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 border border-white"></div>`
          : ''
      }
    </div>
  `;
}

/**
 * Creates the HTML string for modern, sleek cluster bubbles.
 */
export function generateClusterHtml(
  count: number,
  categoryColors: string[],
  isSelected = false
): string {
  const size = count > 9 ? 44 : 38;
  const primaryColor = categoryColors[0] || '#C2185B';

  const gradientStops =
    categoryColors.length > 1
      ? categoryColors.map((c, i) => `${c} ${(i / categoryColors.length) * 100}%`).join(', ')
      : `${primaryColor}, ${primaryColor}`;

  const ringStyle =
    categoryColors.length > 1
      ? `background: conic-gradient(${gradientStops});`
      : `background-color: ${primaryColor};`;

  return `
    <div class="competitor-cluster-wrapper relative cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
         style="width: ${size}px; height: ${size}px;">
      
      <!-- Outer multi-category ring -->
      <div class="absolute inset-0 rounded-full shadow-lg" style="${ringStyle} padding: 3px;">
        <!-- Inner neutral badge surface -->
        <div class="w-full h-full rounded-full bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-white font-bold text-xs shadow-inner">
          <span class="tracking-tight font-mono text-[13px]">${count}</span>
        </div>
      </div>

      <!-- Pulse indicator -->
      <div class="absolute -inset-1 rounded-full opacity-20 animate-pulse" style="background-color: ${primaryColor};"></div>
    </div>
  `;
}
