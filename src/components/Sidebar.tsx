import React from 'react';
import {
  CategoryName,
  CATEGORIES,
  COMPETITIVE_CATEGORIES,
  ONSITE_CATEGORY,
} from '../types/competitor';
import { CompetitorLocation } from '../types/competitor';
import { BrandLogos, BrandLogo } from '../assets/brandLogos';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  allLocations: CompetitorLocation[];
  selectedCategories: CategoryName[];
  onToggleCategory: (category: CategoryName) => void;
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  totalCount: number;
  onSelectLocation: (loc: CompetitorLocation) => void;
  selectedLocationId: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  allLocations,
  selectedCategories,
  onToggleCategory,
  selectedBrands,
  onToggleBrand,
  onResetFilters,
  totalFilteredCount,
  totalCount,
  onSelectLocation,
  selectedLocationId,
}) => {
  // Extract unique competitor brands (excluding QDOBA as it represents current on-site operations)
  const competitorBrands = Array.from(new Set(allLocations.map((l) => l.brand)))
    .filter((b) => b !== 'QDOBA' && b !== 'QDOBA Mexican Eats')
    .sort((a, b) => {
      if (a === 'HomeState') return -1;
      if (b === 'HomeState') return 1;
      return a.localeCompare(b);
    });

  const isAnyFilterActive =
    selectedCategories.length > 0 || selectedBrands.length > 0;

  return (
    <aside
      className={`fixed lg:absolute top-0 bottom-0 left-0 z-40 w-full sm:w-96 bg-white/95 backdrop-blur-xl border-r border-slate-200/90 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Top Header */}
      <div className="p-5 border-b border-slate-100/80 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold mb-1">
              Market Intelligence Study
            </div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
              SOUTH BAY FAST-CASUAL COMPETITOR MAP
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
              Mexican &amp; Adjacent Fast-Casual Competitive Landscape
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
            title="Collapse Sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Global Stats bar & Reset */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-slate-800 font-mono">
              {totalFilteredCount} of {totalCount} locations
            </span>
          </div>

          {isAnyFilterActive && (
            <button
              onClick={onResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Filters Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Section 1: Dedicated On-Site Category (Not in Competitive Categories) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              On-Site Operation
            </h2>
          </div>

          {/* Dedicated Category Card for Current QDOBA operations on-site */}
          {(() => {
            const count = allLocations.filter(
              (l) => l.category === ONSITE_CATEGORY.name
            ).length;
            const isSelected = selectedCategories.includes(ONSITE_CATEGORY.name);

            return (
              <button
                type="button"
                onClick={() => onToggleCategory(ONSITE_CATEGORY.name)}
                className={`w-full text-left p-3 rounded-2xl border transition-all duration-150 group cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-orange-500/40'
                    : 'bg-gradient-to-r from-orange-50/80 via-amber-50/40 to-white hover:bg-orange-100/60 text-slate-800 border-orange-200/90 shadow-xs'
                }`}
                title={`Filter by ${ONSITE_CATEGORY.name}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-full bg-white p-0.5 shrink-0 flex items-center justify-center shadow-xs"
                      style={{ border: `2px solid ${ONSITE_CATEGORY.color}` }}
                    >
                      <BrandLogo brand="QDOBA Mexican Eats" size={20} />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-bold truncate leading-snug ${
                          isSelected ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {ONSITE_CATEGORY.name}
                      </div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-orange-200' : 'text-slate-500'
                        }`}
                      >
                        QDOBA Mexican Eats · LMU Campus
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-orange-200/70 text-orange-950'
                    }`}
                  >
                    {count}
                  </span>
                </div>
              </button>
            );
          })()}
        </div>

        {/* Section 2: Competitive Categories */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Competitive Categories
            </h2>
            <span className="text-[11px] font-mono text-slate-600">
              {COMPETITIVE_CATEGORIES.length} Categories
            </span>
          </div>

          <div className="space-y-1.5">
            {COMPETITIVE_CATEGORIES.map((cat) => {
              const count = allLocations.filter((l) => l.category === cat.name).length;
              const isSelected = selectedCategories.includes(cat.name);

              return (
                <button
                  key={cat.name}
                  onClick={() => onToggleCategory(cat.name)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Visual Color Swatch */}
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <span
                      className={`text-xs font-semibold truncate ${
                        isSelected ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Brands */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Competitor Brands
            </h2>
            <span className="text-[11px] font-mono text-slate-600">{competitorBrands.length} Brands</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {competitorBrands.map((brand) => {
              const brandLocations = allLocations.filter((l) => l.brand === brand);
              const count = brandLocations.length;
              const isSelected = selectedBrands.includes(brand);
              const LogoComp = BrandLogos[brand] || BrandLogos['QDOBA Mexican Eats'] || BrandLogos['QDOBA'];
              const primaryCategoryColor = brandLocations[0]?.categoryColor || '#C2185B';

              return (
                <button
                  key={brand}
                  onClick={() => onToggleBrand(brand)}
                  className={`p-2 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2 group text-left ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-full bg-white shrink-0 flex items-center justify-center shadow-xs ${
                        brand === 'Panera Bread' || brand.startsWith('QDOBA') ? 'p-0 overflow-hidden' : 'p-0.5'
                      }`}
                      style={{ border: `1.5px solid ${primaryCategoryColor}` }}
                    >
                      <LogoComp size={18} />
                    </div>
                    <span
                      className={`text-xs font-semibold truncate ${
                        isSelected ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {brand}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-mono font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Key Competitor Highlights */}
        <div className="pt-2 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Key Strategic Points
          </h2>
          <div className="space-y-2 text-xs">
            {/* QDOBA Callout */}
            <div
              onClick={() => {
                const qdoba = allLocations.find(
                  (l) => l.brand === 'QDOBA Mexican Eats' || l.brand === 'QDOBA'
                );
                if (qdoba) onSelectLocation(qdoba);
              }}
              className="p-3 rounded-xl bg-orange-50/80 border border-orange-200/90 cursor-pointer hover:bg-orange-100/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-950 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full overflow-hidden border border-orange-400 shrink-0 shadow-xs flex items-center justify-center">
                    <BrandLogo brand="QDOBA Mexican Eats" size={20} />
                  </span>
                  QDOBA Mexican Eats
                </span>
                <span className="text-[10px] font-mono bg-orange-200/80 text-orange-900 px-1.5 py-0.5 rounded font-semibold">
                  On-Site Operation
                </span>
              </div>
              <p className="text-[11px] text-orange-900/80 mt-1">
                8420 Loyola Marymount University Dr · Current QDOBA operations on-site (#E65100)
              </p>
            </div>

            {/* Plaza El Segundo Callout */}
            <div
              onClick={() => {
                const plaza = allLocations.find((l) => l.brand === 'Plaza El Segundo');
                if (plaza) onSelectLocation(plaza);
              }}
              className="p-3 rounded-xl bg-yellow-50/70 border border-yellow-200/80 cursor-pointer hover:bg-yellow-100/70 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-yellow-950 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FFD600' }}></span>
                  Plaza El Segundo
                </span>
                <span className="text-[10px] font-mono bg-yellow-200/80 text-yellow-900 px-1.5 py-0.5 rounded font-semibold">
                  Commercial Anchor
                </span>
              </div>
              <p className="text-[11px] text-yellow-900/90 mt-1 leading-relaxed">
                700 S Sepulveda Blvd · Primary Market Analysis Anchor, situated directly across the Sepulveda/Rosecrans corridor from HomeState.
              </p>
            </div>

            {/* HomeState Callout */}
            <div
              onClick={() => {
                const homestate = allLocations.find((l) => l.brand === 'HomeState');
                if (homestate) onSelectLocation(homestate);
              }}
              className="p-3 rounded-xl bg-stone-50/90 border border-stone-200/90 cursor-pointer hover:bg-stone-100/90 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#4E342E' }}></span>
                  HomeState (The Point)
                </span>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-900 font-semibold px-1.5 py-0.5 rounded">
                  ~0.2 mi to Plaza El Segundo
                </span>
              </div>
              <p className="text-[11px] text-stone-700 mt-1 leading-relaxed">
                820 Pacific Coast Hwy #112 · Located at The Point, directly adjacent and within short walking distance (~0.2 miles / 300 yards) of Plaza El Segundo, sharing the exact same primary retail node and consumer traffic flow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
        <span>South Bay Competitive Intelligence</span>
        <span className="font-mono">{totalCount} Total Units</span>
      </div>
    </aside>
  );
};
