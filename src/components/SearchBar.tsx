import React, { useState, useRef, useEffect } from 'react';
import { CompetitorLocation } from '../types/competitor';
import { BrandLogos } from '../assets/brandLogos';

interface SearchBarProps {
  locations: CompetitorLocation[];
  onSelectLocation: (location: CompetitorLocation) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  totalFilteredCount: number;
  totalCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  locations,
  onSelectLocation,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  isSidebarOpen,
  totalFilteredCount,
  totalCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter matching locations
  const trimmed = searchQuery.trim().toLowerCase();
  const matchingLocations = trimmed
    ? locations.filter((loc) => {
        return (
          loc.name.toLowerCase().includes(trimmed) ||
          loc.brand.toLowerCase().includes(trimmed) ||
          loc.address.toLowerCase().includes(trimmed) ||
          loc.city.toLowerCase().includes(trimmed) ||
          loc.category.toLowerCase().includes(trimmed) ||
          loc.zip.includes(trimmed)
        );
      })
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (loc: CompetitorLocation) => {
    onSelectLocation(loc);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSearchChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md pointer-events-auto">
      {/* Floating Modern Search Input Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 flex items-center px-3 py-2 transition-all duration-200 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent">
        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors mr-1 shrink-0"
          title={isSidebarOpen ? 'Hide Filters & Analysis' : 'Show Filters & Analysis'}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Search Icon */}
        <div className="text-slate-400 pl-1 pr-2 shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (searchQuery.trim()) setIsOpen(true);
          }}
          placeholder="Search locations (e.g., QDOBA Mexican Eats, Chipotle, Rosecrans)..."
          className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors ml-1"
            title="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Active counter badge */}
        <div className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-2 shrink-0 border border-slate-200">
          {totalFilteredCount}/{totalCount}
        </div>
      </div>

      {/* Auto-suggest Results Dropdown */}
      {isOpen && searchQuery.trim() && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-slate-100">
          {matchingLocations.length > 0 ? (
            matchingLocations.map((loc) => {
              const LogoComponent = BrandLogos[loc.brand] || BrandLogos['QDOBA Mexican Eats'] || BrandLogos['QDOBA'];
              return (
                <div
                  key={loc.id}
                  onClick={() => handleSelect(loc)}
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors group"
                >
                  {/* Brand Logo with Category Halo ring */}
                  <div
                    className="w-9 h-9 rounded-full bg-white p-0.5 shrink-0 flex items-center justify-center shadow-sm"
                    style={{ border: `2.5px solid ${loc.categoryColor}` }}
                  >
                    <LogoComponent size={28} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {loc.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{loc.address}, {loc.city}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: loc.categoryColor }}
                      ></span>
                      <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wider truncate">
                        {loc.category}
                      </span>
                    </div>
                  </div>

                  <svg
                    className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              );
            })
          ) : (
            <div className="px-5 py-6 text-center text-slate-500">
              <p className="text-sm font-medium text-slate-700">No competitors found</p>
              <p className="text-xs text-slate-400 mt-1">
                No location matching &quot;{searchQuery}&quot; in the South Bay dataset
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
