import React, { useState } from 'react';
import {
  CategoryName,
  ONSITE_CATEGORY,
  COMPETITIVE_CATEGORIES,
} from '../types/competitor';
import { CompetitorLocation } from '../types/competitor';

interface MapLegendProps {
  locations: CompetitorLocation[];
  selectedCategories: CategoryName[];
  onToggleCategory: (category: CategoryName) => void;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  locations,
  selectedCategories,
  onToggleCategory,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const onsiteCount = locations.filter(
    (l) => l.category === ONSITE_CATEGORY.name
  ).length;
  const isOnsiteFiltered =
    selectedCategories.length > 0 &&
    !selectedCategories.includes(ONSITE_CATEGORY.name);

  return (
    <div className="fixed lg:absolute top-20 right-4 sm:right-6 z-30 pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden transition-all duration-200 w-72 sm:w-80">
        {/* Legend Header */}
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Map Legend
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-500 font-semibold">
              {locations.length}
            </span>
            <svg
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isCollapsed ? '-rotate-90' : 'rotate-0'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Legend Body */}
        {!isCollapsed && (
          <div className="p-3 space-y-2.5">
            {/* 1. Dedicated On-Site Category */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1 mb-1">
                On-Site Operation
              </div>
              <div
                onClick={() => onToggleCategory(ONSITE_CATEGORY.name)}
                className={`flex items-center justify-between gap-2.5 p-1.5 rounded-lg cursor-pointer transition-colors group ${
                  isOnsiteFiltered
                    ? 'opacity-40 hover:opacity-70'
                    : 'bg-orange-50/60 hover:bg-orange-100/60 border border-orange-200/60'
                }`}
                title={`Filter by ${ONSITE_CATEGORY.name}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ring-2 ring-white"
                    style={{ backgroundColor: ONSITE_CATEGORY.color }}
                  ></span>
                  <span className="text-[11px] font-semibold text-slate-800 truncate group-hover:text-slate-900">
                    {ONSITE_CATEGORY.name}
                  </span>
                </div>

                <span className="text-[10px] font-mono font-bold text-orange-950 bg-orange-200/80 px-1.5 py-0.2 rounded shrink-0">
                  {onsiteCount}
                </span>
              </div>
            </div>

            {/* 2. Competitive Categories */}
            <div className="pt-1.5 border-t border-slate-100">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1 mb-1">
                Competitive Categories
              </div>
              <div className="space-y-1">
                {COMPETITIVE_CATEGORIES.map((cat) => {
                  const count = locations.filter((l) => l.category === cat.name).length;
                  const isFiltered =
                    selectedCategories.length > 0 && !selectedCategories.includes(cat.name);

                  return (
                    <div
                      key={cat.name}
                      onClick={() => onToggleCategory(cat.name)}
                      className={`flex items-center justify-between gap-2.5 p-1 rounded-lg cursor-pointer transition-colors group ${
                        isFiltered ? 'opacity-40 hover:opacity-70' : 'hover:bg-slate-50'
                      }`}
                      title={`Filter by ${cat.name}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Circle Swatch with Category Halo border */}
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-1 ring-white"
                          style={{ backgroundColor: cat.color }}
                        ></span>
                        <span className="text-[11px] font-medium text-slate-700 truncate group-hover:text-slate-900">
                          {cat.name}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
