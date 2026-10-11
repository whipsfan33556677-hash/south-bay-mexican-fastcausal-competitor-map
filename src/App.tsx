import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { COMPETITOR_LOCATIONS } from './data/competitors';
import { CompetitorLocation, CategoryName } from './types/competitor';
import { MapEngine } from './components/MapEngine';
import { SearchBar } from './components/SearchBar';
import { Sidebar } from './components/Sidebar';
import { LocationCard } from './components/LocationCard';
import { MapLegend } from './components/MapLegend';
import { ValidationModal } from './components/ValidationModal';
import { initAuth, signOutUser, AuthUserProfile } from './services/auth';
import { LoginScreen } from './components/LoginScreen';
import { RestrictedAccessScreen } from './components/RestrictedAccessScreen';
import { BrandLogo } from './assets/brandLogos';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<CategoryName[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [mapStyle, setMapStyle] = useState<'voyager' | 'positron' | 'satellite'>('voyager');

  // Initialize Auth & ACL state listener
  useEffect(() => {
    const unsubscribe = initAuth((user) => {
      setCurrentUser(user);
      setIsCheckingAuth(false);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Collapse sidebar on small screens initially
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Keyboard shortcut listener ('/' to focus search, 'Escape' to deselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedLocationId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered Locations (Derived UI State - Immutable original data)
  const filteredLocations = useMemo(() => {
    return COMPETITOR_LOCATIONS.filter((loc) => {
      // Category filter
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(loc.category)
      ) {
        return false;
      }

      // Brand filter
      if (
        selectedBrands.length > 0 &&
        !selectedBrands.includes(loc.brand)
      ) {
        return false;
      }

      return true;
    });
  }, [selectedCategories, selectedBrands]);

  // Selected Location Object
  const selectedLocation = useMemo(() => {
    if (!selectedLocationId) return null;
    return COMPETITOR_LOCATIONS.find((l) => l.id === selectedLocationId) || null;
  }, [selectedLocationId]);

  // Toggle Category Filter
  const handleToggleCategory = useCallback((category: CategoryName) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }, []);

  // Toggle Brand Filter
  const handleToggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }, []);

  // Reset Filters & View
  const handleResetFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSearchQuery('');
    setSelectedLocationId(null);
    setHoveredLocationId(null);
  }, []);

  // Selection Handler
  const handleSelectLocation = useCallback((location: CompetitorLocation | null) => {
    setSelectedLocationId(location ? location.id : null);
  }, []);

  // 1. Initial Auth Check Loading State
  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white p-1.5 border-3 border-orange-500 animate-pulse flex items-center justify-center shadow-2xl">
            <BrandLogo brand="QDOBA" size={54} />
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-sm font-mono">
            <svg className="animate-spin w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Verifying Access Control List...
          </div>
        </div>
      </div>
    );
  }

  // 2. Not Authenticated -> Show Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => setCurrentUser(user)}
        onLoginRestricted={(user) => setCurrentUser(user)}
      />
    );
  }

  // 3. Authenticated but Unauthorized -> Show Restricted Access Screen
  if (!currentUser.isAuthorized) {
    return (
      <RestrictedAccessScreen
        user={currentUser}
        onSignOut={async () => {
          await signOutUser();
          setCurrentUser(null);
        }}
        onRetryLogin={async () => {
          await signOutUser();
          setCurrentUser(null);
        }}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden flex bg-slate-900">
      {/* 1. Collapsible Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        allLocations={COMPETITOR_LOCATIONS}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        selectedBrands={selectedBrands}
        onToggleBrand={handleToggleBrand}
        onResetFilters={handleResetFilters}
        totalFilteredCount={filteredLocations.length}
        totalCount={COMPETITOR_LOCATIONS.length}
        onSelectLocation={(loc) => {
          setSelectedLocationId(loc.id);
          // On mobile, collapse sidebar when selecting a location
          if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
          }
        }}
        selectedLocationId={selectedLocationId}
      />

      {/* 2. Primary Map Canvas */}
      <main
        className={`relative flex-1 h-full transition-all duration-300 ease-out ${
          isSidebarOpen ? 'lg:ml-96' : 'ml-0'
        }`}
      >
        {/* Modern Interactive Leaflet Map Engine */}
        <MapEngine
          locations={filteredLocations}
          selectedLocationId={selectedLocationId}
          hoveredLocationId={hoveredLocationId}
          onSelectLocation={handleSelectLocation}
          onHoverLocation={setHoveredLocationId}
          mapStyle={mapStyle}
        />

        {/* Floating Top Bar: Search Bar & Map Style Switcher */}
        <div className="absolute top-4 left-4 sm:left-6 right-4 sm:right-6 z-30 pointer-events-none flex flex-wrap items-center justify-between gap-3">
          {/* Floating Search Bar */}
          <SearchBar
            locations={COMPETITOR_LOCATIONS}
            onSelectLocation={(loc) => {
              setSelectedLocationId(loc.id);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
            totalFilteredCount={filteredLocations.length}
            totalCount={COMPETITOR_LOCATIONS.length}
          />

          {/* Quick Map Tile Style Switcher */}
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-1 hidden md:flex items-center gap-1">
            <button
              onClick={() => setMapStyle('voyager')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 ${
                mapStyle === 'voyager'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setMapStyle('positron')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 ${
                mapStyle === 'positron'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Clean Light
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 ${
                mapStyle === 'satellite'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Authenticated User Status & Sign Out */}
          {currentUser && (
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 py-1 px-3 flex items-center gap-2.5">
              <div className="flex items-center gap-2">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-7 h-7 rounded-full border border-slate-300 object-cover shadow-xs"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                    {currentUser.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left leading-tight">
                  <span className="block text-xs font-bold text-slate-900 truncate max-w-[150px]">
                    {currentUser.displayName || currentUser.email.split('@')[0]}
                  </span>
                  <span className="block text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wider">
                    ● ACL Authorized
                  </span>
                </div>
              </div>
              <div className="h-4 w-px bg-slate-200"></div>
              <button
                onClick={async () => {
                  await signOutUser();
                  setCurrentUser(null);
                }}
                title="Sign out of confidential session"
                className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Floating Visual Map Legend (Top-Right) */}
        <MapLegend
          locations={COMPETITOR_LOCATIONS}
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
        />

        {/* Floating Location Information Card (Bottom-Left / Sheet) */}
        <LocationCard
          location={selectedLocation}
          onClose={() => setSelectedLocationId(null)}
          onFocusOnMap={(loc) => setSelectedLocationId(loc.id)}
        />

        {/* Specification & Data Integrity Audit Button */}
        <ValidationModal locations={COMPETITOR_LOCATIONS} />
      </main>
    </div>
  );
}
