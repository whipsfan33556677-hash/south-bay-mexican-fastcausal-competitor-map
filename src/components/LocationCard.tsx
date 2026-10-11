import React, { useState } from 'react';
import { CompetitorLocation } from '../types/competitor';
import { BrandLogos } from '../assets/brandLogos';

interface LocationCardProps {
  location: CompetitorLocation | null;
  onClose: () => void;
  onFocusOnMap: (location: CompetitorLocation) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onClose,
  onFocusOnMap,
}) => {
  const [copied, setCopied] = useState(false);

  if (!location) return null;

  const LogoComponent =
    BrandLogos[location.brand] || BrandLogos['QDOBA Mexican Eats'] || BrandLogos['QDOBA'];

  const handleCopyAddress = () => {
    const fullText = `${location.name}, ${location.address}, ${location.city}, CA ${location.zip}`;
    navigator.clipboard?.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${location.address}, ${location.city}, CA ${location.zip}`
  )}`;

  return (
    <div
      role="dialog"
      aria-label={`${location.name} Details`}
      className="fixed lg:absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-40 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/90 p-5 transition-all duration-200 animate-slideUp pointer-events-auto"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {/* Brand Logo with Mandatory Category Halo */}
          <div
            className={`w-12 h-12 rounded-full bg-white shrink-0 flex items-center justify-center shadow-md relative ${
              location.brand === 'Panera Bread' || location.brand.startsWith('QDOBA') ? 'p-0 overflow-hidden' : 'p-1'
            }`}
            style={{ border: `3.5px solid ${location.categoryColor}` }}
          >
            <LogoComponent size={36} />
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-xs"
              style={{ backgroundColor: location.categoryColor }}
              title={location.category}
            ></span>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
              {location.name}
            </h3>
            <p className="text-xs font-semibold text-slate-600">{location.brand}</p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          title="Close Card"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Category Indicator Badge & Rooftop Precision Tag */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: location.categoryColor }}
          ></span>
          <span className="text-xs font-semibold text-slate-700">
            {location.category}
          </span>
        </div>

        {location.precision && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
              location.precision === 'Rooftop Verified'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : location.precision === 'Entrance Verified'
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {location.precision}
          </span>
        )}
      </div>

      {/* Address & Geographic Coordinates */}
      <div className="mt-3 space-y-2 text-xs text-slate-600 bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 leading-snug">{location.address}</p>
            {location.shoppingCenter && (
              <p className="text-[11px] text-indigo-700 font-medium">{location.shoppingCenter}</p>
            )}
            <p className="text-slate-500">{location.city}, CA {location.zip}</p>
          </div>
        </div>

        {/* Precise Geographic Coordinates (Immutable Rooftop Footprint) */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 font-mono text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>{location.lat.toFixed(5)}° N, {Math.abs(location.lon).toFixed(5)}° W</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Storefront Footprint</span>
        </div>

        {location.notes && (
          <p className="text-[11px] text-slate-500 italic pt-1">
            {location.notes}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Directions
        </a>

        <button
          onClick={handleCopyAddress}
          className="py-2.5 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Address
            </>
          )}
        </button>
      </div>
    </div>
  );
};
